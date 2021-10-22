const letterReg = /[a-zA-Z]/g
const digitReg = /[0-9]/g
const paragraphReg = /\n/;


const addMethod = function(Doc) {
  
  Doc.prototype.counts = function(options) {
    const opts = Object.assign({cache: true}, options)
    if (opts.cache && this._countsCache) return this._countsCache

    var counts = { paragraphs: 0, sentences: 0, 
                    words: 0, characters: 0, 
                    letters: 0, digits: 0    
                  }

    var current = null
    this.list.forEach(sentence => {
      current = sentence
      counts.sentences++
      let terms = sentence.terms()
      terms.forEach(term => {
        let text = term.clean || term.text
        if (text) {
          counts.words++
          counts.characters += term.text.length
          let m = text.match(letterReg)
          if (m && m.length) counts.letters += m.length
          m = text.match(digitReg)
          if (m && m.length) counts.digits += m.length            
        }
        if (current && paragraphReg.test(term.post)) {
          counts.paragraphs++
          current = null;
        }          
      })    
    })   
  
    if (current) counts.paragraphs++
          
    if (opts.cache) this._countsCache = counts
    return counts
  }

  return Doc
}

module.exports = addMethod