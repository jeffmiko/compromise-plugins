const { syllable } = require('syllable')
const { daleChall } = require('dale-chall')
const {daleChallFormula, daleChallGradeLevel} = require('dale-chall-formula')
const {fleschKincaid} = require('flesch-kincaid')
const {smogFormula} = require('smog-formula')
const {colemanLiau} = require('coleman-liau')
const {gunningFog} = require('gunning-fog')
const {automatedReadability} = require('automated-readability')


const letterReg = /[a-zA-Z]/g
const digitReg = /[0-9]/g
const paragraphReg = /\n/;
const simpleWords = new Set(daleChall)


const getCounts = function(doc, options) {
  const opts = Object.assign({cache: true}, options)
  if (opts.cache && doc._countsCache && 
      doc._countsCache.syllables !== undefined) return doc._countsCache

  var counts = { paragraphs: 0, sentences: 0, words: 0, characters: 0, 
                 letters: 0, digits: 0, 
                 syllables: 0, complexWords: 0, 
                 polySyllabicWords: 0, polySyllabicComplexWords: 0, 
              }

  var current = null
  doc.list.forEach(sentence => {
    current = sentence
    counts.sentences++
    let terms = sentence.terms()
    terms.forEach(term => {
      let text = term.clean || term.text
      if (text) {
        let syllables = syllable(term.text)
        counts.words++
        counts.characters += term.text.length
        counts.syllables += syllables
        let m = text.match(letterReg)
        if (m && m.length) counts.letters += m.length
        m = text.match(digitReg)
        if (m && m.length) counts.digits += m.length            
        if (syllables >= 3) {
          counts.polySyllabicWords++
          if (term.pre != '-' && term.post != '-' && !term.tags.ProperNoun) {
            if (text.endsWith("es") || text.endsWith("ed")) {
              // don't count es or ed endings in complex syllable count
              if (syllables >= 4) counts.polySyllabicComplexWords++
            } else {
              counts.polySyllabicComplexWords++
            }
          }
        }
        if (!simpleWords.has(text)) counts.complexWords++
      }
      if (current && paragraphReg.test(term.post)) {
        counts.paragraphs++
        current = null;
      }          
    })    
  })   

  if (current) counts.paragraphs++
       
  if (opts.cache) doc._countsCache = counts
  return counts
}

function runAlgorithms(stats) {

  let data = { }

  data.fleschKincaid = fleschKincaid({sentence: stats.sentences, 
                                            word: stats.words, 
                                            syllable: stats.syllables})
                                            data.daleChall = daleChallFormula({word: stats.words, sentence: stats.sentences, 
                                           difficultWord: stats.complexWords})
  let arr = daleChallGradeLevel(data.daleChall)
  arr = arr.filter(function (n) { return n !== Number.POSITIVE_INFINITY && n !== Number.NaN })
  data.daleChall = arr.reduce((a, b) => a + b) / arr.length

  data.gunningFog = gunningFog({sentence: stats.sentences, word: stats.words, 
                                      complexPolysillabicWord: stats.polySyllabicComplexWords})

  data.colemanLiau = colemanLiau({sentence: stats.sentences, word: stats.words, 
                                  letter: stats.letters+stats.digits })

  data.automatedReadability = automatedReadability({sentence: stats.sentences, 
                                                    word: stats.words, 
                                                    character: stats.letters+stats.digits })

  data.smog = smogFormula({sentence: stats.sentences, 
                           polysillabicWord: stats.polySyllabicWords})

  return data
}

function estimateGrades(algorithms) {
  let grade = { min: 0, max: 0, mean: 0, median: 0, stddev: 0, confidence: {} }                   

  let values = Object.values(algorithms)
  values.sort(function(a,b){ return a-b })
  grade.min = values[0]
  grade.max = values[values.length-1]
  grade.mean =values.reduce((a, b) => a + b) / values.length
  let half = Math.floor(values.length / 2)
  if (values.length % 2)
    grade.median = values[half]
  else
    grade.median = (values[half - 1] + values[half]) / 2.0

  grade.stddev = Math.sqrt(values.map(x => Math.pow(x - grade.mean, 2)).reduce((a, b) => a + b) / values.length)
  //grade.accuracy = 1 / grade.stddev
  grade.confidence = { college: 0, highSchool: 0, middleSchool: 0, elementary: 0, adult: 0 }
  for(let val of values) {
    if (val >= 11.5) grade.confidence.college++
    if (val >= 8.5 && val < 13) grade.confidence.highSchool++
    if (val >= 8.5 ) grade.confidence.adult++
    if (val >= 5.5 && val < 9) grade.confidence.middleSchool++
    if (val >= 0 && val < 6) grade.confidence.elementary++
  }
  grade.confidence.adult = grade.confidence.adult/values.length
  grade.confidence.college = grade.confidence.college/values.length
  grade.confidence.highSchool = grade.confidence.highSchool/values.length
  grade.confidence.middleSchool = grade.confidence.middleSchool/values.length
  grade.confidence.elementary = grade.confidence.elementary/values.length

  let max = Math.max(grade.confidence.college, grade.confidence.highSchool, 
                      grade.confidence.middleSchool, grade.confidence.elementary)

  let levels = []                      
  if (max == grade.confidence.college) levels.push("College")
  if (max == grade.confidence.highSchool) levels.push("High School")
  if (max == grade.confidence.middleSchool) levels.push("Middle School")
  if (max == grade.confidence.elementary) levels.push("Elementary School")
  if (levels.length == 1) {
    grade.level = levels[0]
  } else {
    if (grade.median >= 12) grade.level = 'College'
    else if (grade.median >= 9 ) grade.level = 'High School'
    else if (grade.median >= 6 ) grade.level = 'Middle School'
    else grade.level = 'Elementary School'
  }
  return grade
}

const addMethod = function(Doc) {
  
  Doc.prototype.readability = function(options) {
    const opts = Object.assign({cache: true}, options)
    let counts = getCounts(this, opts)
    let algorithms = runAlgorithms(counts)
    let grades = estimateGrades(algorithms)
    return Object.assign({algorithms}, grades)
  }

  return Doc
}

module.exports = addMethod