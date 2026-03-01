/* eslint-disable no-restricted-syntax */
/* eslint-disable lines-between-class-members */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-shadow */

import {
  ViewPlugin,
  EditorView,
  ViewUpdate,
  WidgetType,
  Decoration,
  DecorationSet
} from '@codemirror/view';
import { Extension, Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import colors from 'colors-named';
import hexs from 'colors-named-hex';
import hslMatcher, { hlsStringToRGB, RGBAColor } from 'hsl-matcher';
import { toFullHex, rgbToHex, hexToRgb, RGBToHSL } from './utils';

export enum ColorType {
  rgb = 'RGB',
  hex = 'HEX',
  named = 'NAMED',
  hsl = 'HSL'
}

export interface ColorState {
  from: number;
  to: number;
  alpha: string;
  colorType: ColorType;
}

const colorState = new WeakMap<HTMLInputElement, ColorState>();

type GetArrayElementType<
  T extends readonly any[]
> = T extends readonly (infer U)[] ? U : never;

const matchingTypes = ['CallExpression', 'String'];

function colorDecorations(view: EditorView) {
  const widgets: Array<Range<Decoration>> = [];
  for (const range of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from: range.from,
      to: range.to,
      enter: ({ type, from, to }) => {
        const rawCallExp: string = view.state.doc.sliceString(from, to);
        const callExp =
          type.name === 'String' ? rawCallExp.replaceAll('"', '') : rawCallExp;
        /**
         * ```
         * rgb(0 107   128, .5);         ❌ ❌ ❌
         * rgb( 0 107   128 );           ✅ ✅ ✅
         * RGB( 0 107   128 );           ✅ ✅ ✅
         * Rgb( 0 107   128 );           ✅ ✅ ✅
         * rgb( 0 107 128 / );           ❌ ❌ ❌
         * rgb( 0 107 128 /   60%);      ✅ ✅ ✅
         * rgb(0,107,128 / 60%);         ❌ ❌ ❌
         * rgb( 255, 255, 255 )          ✅ ✅ ✅
         * rgba( 255, 255, 255 )         ✅ ✅ ✅
         * rgba( 255, 255  , 255, )      ❌ ❌ ❌
         * rgba( 255, 255  , 255,  .5 )  ✅ ✅ ✅
         * rgba( 255 255 255 / 0.5 );    ✅ ✅ ✅
         * rgba( 255 255 255   0.5 );    ❌ ❌ ❌
         * rgba( 255 255 255 /  );       ❌ ❌ ❌
         * ```
         */
        // console.log(
        //   'checking',
        //   { type: type.name, callExp },
        //   matchingTypes.includes(type.name)
        // );
        // console.log('checking', callExp.startsWith('rgb'));

        if (matchingTypes.includes(type.name) && callExp.startsWith('rgb')) {
          // console.log('rgb matched', callExp);
          const match =
            /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,?\s*(\d{1,3})\s*(,\s*\d*\.\d*\s*)?\)/i.exec(
              callExp
            ) ||
            /rgba?\(\s*(\d{1,3})\s*(\d{1,3})\s*(\d{1,3})\s*(\/?\s*\d+%)?(\/\s*\d+\.\d\s*)?\)/i.exec(
              callExp
            );
          if (!match) return;
          const [_, r, g, b, a] = match;
          const hex = rgbToHex(Number(r), Number(g), Number(b));
          const widget = Decoration.widget({
            widget: new ColorWidget({
              colorType: ColorType.rgb,
              color: hex,
              colorRaw: callExp,
              from,
              to,
              alpha: a ? a.replace(/(\/|,)/g, '') : ''
            }),
            side: 0
          });
          console.log('pushing widget for rgb', { r, g, b, a, hex });
          widgets.push(widget.range(from));
        } else if (matchingTypes.includes(type.name) && hslMatcher(callExp)) {
          /**
           * # valid
           * hsl(240, 100%, 50%)                           // ✅ comma separated
           * hsl(240, 100%, 50%, 0.1)                      // ✅ comma separated with opacity
           * hsl(240, 100%, 50%, 10%)                      // ✅ comma separated with % opacity
           * hsl(240,100%,50%,0.1)                         // ✅ comma separated without spaces
           * hsl(180deg, 100%, 50%, 0.1)                   // ✅ hue with 'deg'
           * hsl(3.14rad, 100%, 50%, 0.1)                  // ✅ hue with 'rad'
           * hsl(200grad, 100%, 50%, 0.1)                  // ✅ hue with 'grad'
           * hsl(0.5turn, 100%, 50%, 0.1)                  // ✅ hue with 'turn'
           * hsl(-240, -100%, -50%, -0.1)                  // ✅ negative values
           * hsl(+240, +100%, +50%, +0.1)                  // ✅ explicit positive sign
           * hsl(240.5, 99.99%, 49.999%, 0.9999)           // ✅ non-integer values
           * hsl(.9, .99%, .999%, .9999)                   // ✅ fraction w/o leading zero
           * hsl(0240, 0100%, 0050%, 01)                   // ✅ leading zeros
           * hsl(240.0, 100.00%, 50.000%, 1.0000)          // ✅ trailing decimal zeros
           * hsl(2400, 1000%, 1000%, 10)                   // ✅ out of range values
           * hsl(-2400.01deg, -1000.5%, -1000.05%, -100)   // ✅ combination of above
           * hsl(2.40e+2, 1.00e+2%, 5.00e+1%, 1E-3)        // ✅ scientific notation
           * hsl(240 100% 50%)                             // ✅ space separated (CSS Color Level 4)
           * hsl(240 100% 50% / 0.1)                       // ✅ space separated with opacity
           * hsla(240, 100%, 50%)                          // ✅ hsla() alias
           * hsla(240, 100%, 50%, 0.1)                     // ✅ hsla() with opacity
           * HSL(240Deg, 100%, 50%)                        // ✅ case insensitive
           */
          const match = hlsStringToRGB(callExp) as RGBAColor;
          if (!match) return;
          const { r, g, b } = match;
          const hex = rgbToHex(Number(r), Number(g), Number(b));
          const widget = Decoration.widget({
            widget: new ColorWidget({
              colorType: ColorType.hsl,
              color: hex,
              colorRaw: callExp,
              from,
              to,
              alpha: match.a ? match.a.toString() : ''
            }),
            side: 0
          });
          widgets.push(widget.range(from));
        } else if (type.name === 'ColorLiteral') {
          const [color, alpha] = toFullHex(callExp);
          const widget = Decoration.widget({
            widget: new ColorWidget({
              colorType: ColorType.hex,
              color,
              colorRaw: callExp,
              from,
              to,
              alpha
            }),
            side: 0
          });
          widgets.push(widget.range(from));
        } else if (type.name === 'ValueName') {
          const name = (callExp as unknown) as GetArrayElementType<
            typeof colors
          >;
          if (colors.includes(name)) {
            const widget = Decoration.widget({
              widget: new ColorWidget({
                colorType: ColorType.named,
                color: hexs[colors.indexOf(name)],
                colorRaw: callExp,
                from,
                to,
                alpha: ''
              }),
              side: 0
            });
            widgets.push(widget.range(from));
          }
        }
      }
    });
  }
  return Decoration.set(widgets);
}

function pickColor(dispatch: boolean) {
  return function f(e: Event, view: EditorView) {
    const target = e.target as HTMLInputElement;
    console.log(
      'pick color event',
      e,
      target,
      target.dataset.color,
      target.dataset.colorraw
    );
    if (
      target.nodeName !== 'INPUT' ||
      !target.parentElement ||
      (!target.dataset.color && !target.dataset.colorraw)
    )
      return false;
    const data = colorState.get(target)!;
    const value = target.value;
    const rgb = hexToRgb(value);
    const colorraw = target.dataset.colorraw;
    const slash = (target.dataset.colorraw || '').indexOf('/') > 4;
    const comma = (target.dataset.colorraw || '').indexOf(',') > 4;
    let converted = target.value;
    if (data.colorType === ColorType.rgb) {
      // console.log({ colorraw, slash, comma });
      let funName = colorraw?.match(/^(rgba?)/)
        ? colorraw?.match(/^(rgba?)/)![0]
        : undefined;
      if (comma) {
        converted = rgb
          ? `${funName}(${rgb.r}, ${rgb.g}, ${rgb.b}${
              data.alpha ? ', ' + data.alpha.trim() : ''
            })`
          : value;
      } else if (slash) {
        converted = rgb
          ? `${funName}(${rgb.r} ${rgb.g} ${rgb.b}${
              data.alpha ? ' / ' + data.alpha.trim() : ''
            })`
          : value;
      } else {
        converted = rgb ? `${funName}(${rgb.r} ${rgb.g} ${rgb.b})` : value;
      }
    } else if (data.colorType === ColorType.hsl) {
      const rgb = hexToRgb(value);
      if (rgb) {
        const { h, s, l } = RGBToHSL(rgb?.r, rgb?.g, rgb?.b);
        converted = `hsl(${h}deg ${s}% ${l}%${
          data.alpha ? ' / ' + data.alpha : ''
        })`;
      }
    }
    if (dispatch) {
      view.dispatch({
        changes: {
          from: data.from,
          to: data.to,
          insert: converted
        }
      });
      data.to = data.from + converted.length;
    }

    return true;
  };
}

class ColorWidget extends WidgetType {
  private readonly state: ColorState;
  private readonly color: string;
  private readonly colorRaw: string;

  constructor({
    color,
    colorRaw,
    ...state
  }: ColorState & {
    color: string;
    colorRaw: string;
  }) {
    super();
    this.state = state;
    this.color = color;
    this.colorRaw = colorRaw;
  }
  eq(other: ColorWidget) {
    return (
      other.state.colorType === this.state.colorType &&
      other.state.from === this.state.from
    );
  }
  toDOM() {
    const picker = document.createElement('input');
    colorState.set(picker, this.state);
    picker.type = 'color';
    picker.value = this.color;
    picker.dataset['color'] = this.color;
    picker.dataset['colorraw'] = this.colorRaw;
    const wrapper = document.createElement('span');
    wrapper.appendChild(picker);
    wrapper.dataset['color'] = this.color;
    wrapper.style.backgroundColor = this.colorRaw;
    return wrapper;
  }
  ignoreEvent() {
    return false;
  }
}

export const colorView = (showPicker: boolean = true) =>
  ViewPlugin.fromClass(
    class ColorView {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = colorDecorations(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          console.log('updating decorations for color widget');
          this.decorations = colorDecorations(update.view);
        }
        // const readOnly = update.view.contentDOM.ariaReadOnly === 'true';
        // const editable = update.view.contentDOM.contentEditable === 'true';

        // const canBeEdited = readOnly === false && editable;
        // this.changePicker(update.view, canBeEdited);
      }
      // changePicker(view: EditorView, canBeEdited: boolean) {
      //   const doms = view.contentDOM.querySelectorAll('input[type=color]');
      //   doms.forEach((inp) => {
      //     if (!showPicker) {
      //       inp.setAttribute('disabled', '');
      //     } else {
      //       canBeEdited
      //         ? inp.removeAttribute('disabled')
      //         : inp.setAttribute('disabled', '');
      //     }
      //   });
      // }
    },
    {
      decorations: (v) => v.decorations,
      eventHandlers: {
        change: pickColor(true),
        input: pickColor(true)
      }
    }
  );

export const colorTheme = EditorView.baseTheme({
  'span[data-color]': {
    width: '12px',
    height: '12px',
    display: 'inline-block',
    borderRadius: '2px',
    marginRight: '0.5ch',
    outline: '1px solid #00000040',
    overflow: 'hidden',
    verticalAlign: 'middle',
    marginTop: '-2px'
  },
  'span[data-color] input[type="color"]': {
    background: 'transparent',
    display: 'block',
    border: 'none',
    outline: '0',
    paddingLeft: '24px',
    height: '12px'
  },
  'span[data-color] input[type="color"]::-webkit-color-swatch': {
    border: 'none',
    paddingLeft: '24px'
  }
});

export const color: Extension = [colorView(), colorTheme];
