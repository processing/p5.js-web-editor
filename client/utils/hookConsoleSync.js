import parse from 'console-feed/lib/Hook/parse';
import methods from 'console-feed/lib/definitions/Methods';
import { Encode } from 'console-feed';

/**
 * Synchronous replacement for console-feed's Hook. Encodes function
 * arguments immediately, so the values of mutable arguments are
 * captured accurately.
 *
 * (See https://github.com/samdenty/console-feed/pull/77.)
 */
export default function hookConsoleSync(targetConsole, callback) {
  methods.forEach((method) => {
    const native = targetConsole[method];
    targetConsole[method] = function patched(...args) {
      native.apply(this, args);
      const parsed = parse(method, args);
      if (parsed) callback(Encode(parsed));
    };
  });
}
