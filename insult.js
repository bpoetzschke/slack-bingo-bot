/**
 * Created by Jonas on 04/09/2017.
 */
"use strict";

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateInsult(name) {
    
    let trumpInsults = [
        {insults:"[NAME] did an absolutely horrible job. [NAME] should be ashamed of himself."},
        {insults:"All [NAME] does is talk"},
        {insults:"Liberal clown [NAME]"},
        {insults:"Hokey garbage [NAME]"},
        {insults:"Goofball atheist [NAME] never had a chance. "},
        {insults:"Boring guy [NAME]"},
        {insults:'Irrelevant clown [NAME] sweats and shakes nervously as they talk "bull" about me. Has zero cred.'},
        {insults:"When will [NAME] start to apologize to me?"},
        {insults:"I hear that sleepy eyes [NAME] will be fired like a dog? I can't imagine what is taking so long!"},
        {insults:"Love watching [NAME] fail!"},
        {insults:"Why does [NAME] constantly seek out trivial nonsense? "},
        {insults:"Dummy [NAME]"},
        {insults:"Do you believe highly overrated [NAME]? What a dope! "},
        {insults:"[NAME] needs a new pair of glasses"},
        {insults:"Hypocrite [NAME]"},
        {insults:"[NAME] was terrible"},
        {insults:"[NAME] apologized to me but I will not accept their apology. I will be suing them for a lot of money."},
        {insults:"[NAME] did really poorly on television this morning. I hope they are O.K."},
        {insults:"Uncomfortable looking [NAME] calls me to ask for favors and then mockingly smiles"},
        {insults:"[NAME] graduated last in their class--dummy!"},
        {insults:"[NAME]'s got a lot of problems! "},
        {insults:"[NAME] is desperate. No imagination! "},
        {insults:"[NAME] lost much of their money on that run — that’s why [NAME] carries their own bags now"},
        {insults:"Total lightweight [NAME]"},
        {insults:"[NAME] is a total loser."},
        {insults:"Losers such as [NAME] use me for publicity for themselves. They are strictly third rate."},
        {insults:"[NAME] is a totally overrated clown who speaks without knowing the facts. "},
        {insults:"[NAME] is truly as dumb as rock."},
        {insults:"[NAME] is a dummy. Just look at [NAME]'s past."},
        {insults:"[NAME] works really hard but is a guy who just doesn't have it--a total loser! "}
    ];

    if (!name) {
        name = "No sentence writer"
    }

    return trumpInsults[getRandomInt(0, trumpInsults.length-1)].replace(/[NAME]/g, name); //Replace "[NAME]".
}


module.exports = {
    generate: generateInsult
}