const test = require('tape')
const nlp = require('compromise')
nlp.extend(require(`../`))

test('word count basic', function(t) {
  let doc = nlp(`The dog jumped the fence. The dog got hurt.`)
  let counts = doc.counts()
  t.equal(counts.words, 9, 'word count basic correct')
  t.end()
})

test('word count contraction', function(t) {
  let doc = nlp(`I didn't go the store.`)
  let counts = doc.counts()
  t.equal(counts.words, 5, 'word count contraction correct')
  t.end()
})

