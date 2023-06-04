const test = require('tape')
const nlp = require('compromise')
const pluralize = require('pluralize')
nlp.extend(require(`../`))


test('Nouns', function(t) {
  let doc = nlp(`A film crew member died and another was injured after actor Alec Baldwin discharged a prop firearm on the set of the movie "Rust" in New Mexico on Thursday, authorities said
    But how can a prop gun kill someone?
    "Prop weapons do have a dangerous factor to them even though they're a lot safer than using a live firearm on set," says Joseph Fisher, a prop master who works on movie sets and has handled weapons in the military and with the NYPD. "Typical prop load will be about 25 to 50% of the gunpowder in an actual projectile load that would be used in a regular weapon."
    Fisher said those on set "take extreme caution with any kind of weapons, whether they be prop guns, blank guns, and anything in between.   
    "Typically, we will do a safety brief with the cast and crew. We'll introduce the weapon to the cast and crew, we'll let them examine it, we'll explain the safety precautions that go with each type of prop weapon," he told CNN.  
    In a scene involving prop guns, "we do safety distances, we try to keep the actors slightly misaligned with the weapon, so that if the person firing the weapon is firing straight this way, the other actors in frames is just slightly off," Fisher explained from Dayton, Ohio.`)

    doc = nlp('This is my second insight about fallacies and Alec Baldwin. Murder is a heinous crime.')
  //console.log(doc.json()[0].terms)

  //console.log(doc.terms().toSingular().out('array'))
  /*
  doc.list.forEach(sentence => {
    let terms = sentence.terms()
    terms.forEach(term => {
      if ((term.tags.Noun || term.tags.ProperNoun) && !term.tags.Pronoun) {
        // if plural make singular 
        let text = term.clean || term.text
        if (text) {
          if (term.tags.Plural) {
            text = pluralize.singular(text)
          }  
          console.log("NOUN:", text, term.tags)
        }  
      }
    })
  })
  */

  doc.list.forEach(sentence => {
    let terms = sentence.terms()
    terms.forEach(term => {
      console.log(term)
    })
  })


  t.end()
})

