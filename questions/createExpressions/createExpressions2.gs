/**
 * @file: A tweak of createExpressions containing a list of a few easier questions
 *   with exponential and power expressions/equations.
 */

var t = waxon.questions.createExpressions.tweak('createExpressions2');
t.title = 'Skapa exponential- och potensekvationer';
t.shortTitle = 'Skapa ekvationer';

t.questions = [];

t.questions.push({
  description : '3000 personer är smittade av malaria i ett område, och antalet smittade ökar med 7% varje vecka. Ställ upp ett uttryck som beskriver antalet smittade när det gått x veckor.',
  variables : {
    x : 'hidden',
  },
  questionLabel : 'Uttryck:',
  correctExpression : '3000*1.07^x',
});

t.questions.push({
  description : '3000 personer är smittade av malaria i ett område, och antalet smittade ökar med 7% varje vecka. Ställ upp en ekvation som kan användas för att bestämma när 10 000 personer är smittade.',
  variables : {
    x : 'Variabel för antalet veckor som gått',
  },
  questionLabel : 'Ekvation',
  correctExpression : '3000*1.07^x=10000',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'Företaget Grax hade 2013 en vinst på 300 000 kr. De räknar med att öka sin vinst med 5% varje år. Skriv en funktion som visar hur stor den förväntade vinsten är x år efter 2013.',
  variables : {
    x : 'hidden',
  },
  questionLabel : 'f(x)=',
  correctExpression : '300000*1.05^x',
});

t.questions.push({
  description : 'Företaget Grax hade 2013 en vinst på 300 000 kr. De räknar med att öka sin vinst med 5% varje år. Skriv en ekvation som visar när den förväntade vinsten är 400 000 kr.',
  variables : {
    x : 'Variabel för antalet år som gått sedan 2013',
  },
  questionLabel : 'Ekvation',
  correctExpression : '300000*1.05^x=400000',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'Dr Evil har 15 kg radioaktivt jod. Det sönderfaller i en takt som gör att 9% av jodet försvinner varje dag. Skriv ett uttryck som visar hur mycket jod dr Evil har efter x dagar.',
  variables : {
    x : 'hidden',
  },
  questionLabel : 'Uttryck:',
  correctExpression : '15*0.91^x',
});

t.questions.push({
  description : 'Dr Evil har 15 kg radioaktivt jod. Det sönderfaller i en takt som gör att 9% av jodet försvinner varje dag. Skriv en ekvation som visar när dr Evil har 2 kg jod kvar.',
  variables : {
    x : 'Variabel för antalet dagar som gått',
  },
  questionLabel : 'Ekvation',
  correctExpression :  '15*0.91^x=2',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'Det finns idag (år 2014) ca 24 000 isbjörnar, och vi kan gissa att de minskar med 4 % varje år. Skriv en funktion som visar hur många isbjörnar det finns när det gått x år efter 2014.',
  variables : {
    x : 'hidden',
  },
  questionLabel : 'f(x)=',
  correctExpression : '24000*0.96^x',
});

t.questions.push({
  description : 'Det finns idag (år 2014) ca 24 000 isbjörnar, och vi kan gissa att de minskar med 4% varje år. Skriv en ekvation som kan användas för att avgöra när det finns 2 000 isbjörnar.',
  variables : {
    x : 'Variabel för antalet år som gått sedan 2014',
  },
  questionLabel : 'Ekvation',
  correctExpression :  '24000*0.96^x=2000',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'Dr Good odlar en bakteriestam för att rädda världen. Hon har 3000 bakterier, och hon ger dem näring så att antalet fördubblas varje dag. Skriv en funktion som visar hur många bakterier det finns efter x dagar.',
  variables : {
    x : 'hidden',
  },
  questionLabel : 'f(x)=',
  correctExpression : '3000*2^x',
});

t.questions.push({
  description : 'Dr Good odlar en bakteriestam för att rädda världen. Hon har 3000 bakterier, och hon ger dem näring så att antalet fördubblas varje dag. Skriv en ekvation som visar hur många dagar hon måste vänta innan hon har en miljard bakterier.',
  variables : {
    x : 'Variabel för antalet dagar som gått',
  },
  questionLabel : 'Ekvation',
  correctExpression :  '3000*2^x=1000000000',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'År 1750 var det 750 miljoner människor i världen, och befolkning ökade med 0,57% varje år i två sekel. Skriv en funktion som visar hur många <em>miljoner</em> människor det var i världen x år efter 1750.',
  variables : {
    x : 'hidden',
  },
  questionLabel : 'f(x)=',
  correctExpression : '750*1.0057^x',
});

t.questions.push({
  description : 'År 1750 var det 750 miljoner människor i världen, och befolkning ökade med 0,57% varje år i två sekel. Skriv en ekvation som visar när befolkningen var 1 miljard.',
  variables : {
    x : 'Variabel för antalet år som gått från 1750',
  },
  questionLabel : 'Ekvation',
  correctExpression :  '750*1.0057^x=1000',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'När Sofia föddes satte hennes mormor in pengar på ett bankkonto till henne. De pengarna har vuxit med 3% varje år, och nu när Sofia fyller 18 finns det 15 000 kr på kontot. Skriv en ekvation som kan användas för att bestämma hur mycket pengar Sofias mormor satte in från början.',
  variables : {
    x : 'Variabel för antal kr från början',
  },
  questionLabel : 'Ekvation',
  correctExpression :  'x*1.03^18=15000',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'Ebola sprids för närvarande (hösten 2014) med en otäck hastighet: Antalet smittade fördubblas var 20:e dag. Skriv en ekvation som kan användas för att ta reda på förändringsfaktorn för antalet smittade <em>per dag</em>.',
  variables : {
    x : 'Variabel för förändringsfaktorn',
  },
  questionLabel : 'Ekvation',
  correctExpression :  'x^20=2',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'Elin sparar till en ny moped. För tre år sedan satte hon in 4000 kr på ett konto, och de har nu växt till 4500 kr. Skriv en ekvation som kan användas för att ta reda på med vilken förändringsfaktor pengarna vuxit.',
  variables : {
    x : 'Variabel för förändringsfaktorn',
  },
  questionLabel : 'Ekvation',
  correctExpression :  '4000*x^4=5000',
  isEquation : true,
  freeVar : 'x',
  substitutions : {
  },
});

t.questions.push({
  description : 'Rasputin har lånat två miljoner för att köpa en bostad. Årsräntan är 3 procent. Skriv en funktion som visar hur mycket han är skyldig varje år, om han inte gör några amorteringar (avbetalningar).',
  variables : {
    x : 'Variabel antalet år som gått',
  },
  questionLabel : 'funktionsuttryck',
  correctExpression :  '2000000*1.03^x',
});
