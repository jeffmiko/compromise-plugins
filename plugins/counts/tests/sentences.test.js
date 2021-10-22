const test = require('tape')
const nlp = require('compromise')
nlp.extend(require(`../`))

test('sentence count basic', function(t) {
  let doc = nlp(`The dog jumped the fence. The dog got hurt.`)
  let counts = doc.counts()
  t.equal(counts.sentences, 2, 'sentence count basic correct')
  t.end()
})

test('sentence count money', function(t) {
  let doc = nlp(`I went to the store. It cost me $43.12.`)
  let counts = doc.counts()
  t.equal(counts.sentences, 2, 'sentence count money correct')
  t.end()
})

