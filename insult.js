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
        "[NAME] did an absolutely horrible job. [NAME] should be ashamed of himself.",
        "All [NAME] does is talk",
        "Liberal clown [NAME]",
        "Hokey garbage [NAME]",
        "Goofball atheist [NAME] never had a chance. ",
        "Boring guy [NAME]",
        'Irrelevant clown [NAME] sweats and shakes nervously as they talk "bull" about me. Has zero cred.',
        "When will [NAME] start to apologize to me?",
        "I hear that sleepy eyes [NAME] will be fired like a dog? I can't imagine what is taking so long!",
        "Love watching [NAME] fail!",
        "Why does [NAME] constantly seek out trivial nonsense? ",
        "Dummy [NAME]",
        "Do you believe highly overrated [NAME]? What a dope! ",
        "[NAME] needs a new pair of glasses",
        "Hypocrite [NAME]",
        "[NAME] was terrible",
        "[NAME] apologized to me but I will not accept their apology. I will be suing them for a lot of money.",
        "[NAME] did really poorly on television this morning. I hope they are O.K.",
        "Uncomfortable looking [NAME] calls me to ask for favors and then mockingly smiles",
        "[NAME] graduated last in their class--dummy!",
        "[NAME]'s got a lot of problems! ",
        "[NAME] is desperate. No imagination! ",
        "[NAME] lost much of their money on that run — that’s why [NAME] carries their own bags now",
        "Total lightweight [NAME]",
        "[NAME] is a total loser.",
        "Losers such as [NAME] use me for publicity for themselves. They are strictly third rate.",
        "[NAME] is a totally overrated clown who speaks without knowing the facts. ",
        "[NAME] is truly as dumb as rock.",
        "[NAME] is a dummy. Just look at [NAME]'s past.",
        "[NAME] works really hard but is a guy who just doesn't have it--a total loser!",
        "[NAME] is an unbelievable nasty, mean enabler.",
        "[NAME] you are a spiled brat without a properly functioning brain."
    ];

    if (!name) {
        name = "No sentence writer"
    }

    let insultIndex = getRandomInt(0, trumpInsults.length-1);
    console.log(trumpInsults[insultIndex])
    return trumpInsults[insultIndex].replace('[NAME]', name); //Replace "[NAME]".
}

module.exports = {
    generate: generateInsult
}
