/* compromise-counts 0.0.1 MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.compromiseCounts = factory());
}(this, (function () { 'use strict';

  var letterReg = /[a-zA-Z]/g;
  var digitReg = /[0-9]/g;
  var paragraphReg = /\n/;

  var addMethod = function addMethod(Doc) {
    Doc.prototype.counts = function (options) {
      var opts = Object.assign({
        cache: true
      }, options);
      if (opts.cache && this._countsCache) return this._countsCache;
      var counts = {
        paragraphs: 0,
        sentences: 0,
        words: 0,
        characters: 0,
        letters: 0,
        digits: 0
      };
      var current = null;
      this.list.forEach(function (sentence) {
        current = sentence;
        counts.sentences++;
        var terms = sentence.terms();
        terms.forEach(function (term) {
          var text = term.clean || term.text;

          if (text) {
            counts.words++;
            counts.characters += term.text.length;
            var m = text.match(letterReg);
            if (m && m.length) counts.letters += m.length;
            m = text.match(digitReg);
            if (m && m.length) counts.digits += m.length;
          }

          if (current && paragraphReg.test(term.post)) {
            counts.paragraphs++;
            current = null;
          }
        });
      });
      if (current) counts.paragraphs++;
      if (opts.cache) this._countsCache = counts;
      return counts;
    };

    return Doc;
  };

  var src = addMethod;

  return src;

})));
//# sourceMappingURL=compromise-counts.js.map
