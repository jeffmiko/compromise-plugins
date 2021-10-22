const test = require('tape')
const nlp = require('compromise')
nlp.extend(require(`../`))

test('paragraph count basic', function(t) {
  let doc = nlp(`The dog jumped the fence. The dog got hurt.\nI went to work.`)
  let counts = doc.counts()
  t.equal(counts.paragraphs, 2, 'paragraph count basic correct')
  t.end()
})

test('paragraph count extra lines', function(t) {
  let doc = nlp(`The dog jumped the fence.\r\nThe dog got hurt.\n\n\r\nI went to work.`)
  let counts = doc.counts()
  t.equal(counts.paragraphs, 3, 'paragraph count extra lines correct')
  t.end()
})

