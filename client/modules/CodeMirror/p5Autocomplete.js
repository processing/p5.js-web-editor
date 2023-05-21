import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import {
  p5FunctionKeywords,
  p5VariableKeywords
} from '../../utils/p5-keywords';

const p5AutocompleteSource = completeFromList(
  Object.keys(p5FunctionKeywords)
    .map((keyword) => ({
      label: keyword,
      type: 'function',
      boost: 99 // TODO: detail
    }))
    .concat(
      Object.keys(p5VariableKeywords).map((keyword) => ({
        label: keyword,
        type: 'constant',
        boost: 50 // TODO: detail
      }))
    )
);

// TODO: only if language is js!!
const p5AutocompleteExt = autocompletion({
  override: [p5AutocompleteSource] // TODO: include native JS
});

export default p5AutocompleteExt;
