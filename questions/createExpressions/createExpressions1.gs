/**
 * @file: A tweak of createExpressions containing a list of 19 easier questions
 *   with linear, quadratic and exponential expressions/equations.
 */

var t = waxon.questions.createExpressions.tweak('createExpressions1');
t.title = 'Skapa algebraiska uttryck och ekvationer';
t.shortTitle = 'Uttryck och ekvationer';

t.questions = [
  {
    description : 'Omkretsen på en rektangel är 26 cm. Skriv en ekvation som beskriver sambandet mellan längden och bredden på rektangeln.',
    variables : {
      l : 'Variabel för rektangelns längd:',
      b : 'Variabel för rektangelns bredd:',
    },
    questionLabel : 'Samband:',
    correctExpression : '2l+2b=26',
    isEquation : true,
    freeVar : 'l',
    substitutions : {
      b : '13-l',
    },
  },
  {
    description : 'Sam och Tom är syskon. Tom är fem år äldre än Sam. Skriv en ekvation som beskriver det sambandet.',
    variables : {
      s : 'Variabel för Sams ålder:',
      t : 'Variabel för Toms ålder:',
    },
    questionLabel : 'Samband:',
    isEquation : true,
    freeVar : 's',
    substitutions : {
      t : 's+5',
    },
  },
  {
    description : 'Herr Dubois vägde 125 kg när han bestämde sig för att gå ner i vikt. Han går ner 0,5 kg i veckan. Skriv uttryck som visar hur mycket herr Dubois väger efter x veckor.',
    variables : {
      x : 'hidden',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '125-0.5*x',
  },
  {
    description : 'David och Goliat bråkar. Goliat har ett överläge, eftersom han väger dubbelt så mycket som David. Skriv en ekvation som beskriver sambandet mellan deras vikter.',
    variables : {
      d : 'Variabel för Davids vikt:',
      g : 'Variabel för Goliats vikt:',
    },
    questionLabel : 'Samband:',
    correctExpression : 'g=2*d',
    isEquation : true,
    freeVar : 'd',
    substitutions : {
      g : '2*d',
    },
  },
  {
    description : 'Usama handlar gurka på torget. Gurkan kostar 19 kr per kg. Usama köper x kg gurka och betalar 55 kr. Skriv en ekvation som beskriver detta.',
    variables : {
      x : 'hidden',
    },
    questionLabel : 'Ekvation:',
    correctExpression : '19x=55',
    isEquation : true,
    freeVar : 'x',
    substitutions : {
    },
  },
  {
    description : 'Det ligger redan 7 cm snö på marken när det börjar snöa en natt. Varje timme faller 3 cm snö. Skriv en funktion f(t) som visar hur tjockt snölagret är efter t timmar.',
    variables : {
      t : 'hidden',
    },
    questionLabel : 'f(t)=',
    correctExpression : '7+3t',
  },
  {
    description : 'Raymond är blixtsnabb på att räkna tandpetare. I en ask ligger 300 tandpetare, och alla utom x tandpetare tappas ner på golvet. Skriv ett uttryck som visar hur många tandpetare som ligger på golvet.',
    variables : {
      x : 'hidden',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '300-x',
  },
  {
    description : 'Varje blad i en bok är 0,1 mm tjock, och pärmarna på boken är tillsammans 3 mm tjocka. Skriv ett uttryck för hur tjock hela boken är.',
    variables : {
      s : 'Variabel för antal sidor i boken:',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '0,1s+3',
  },



  {
    description : 'I en rektangel är längden dubbelt så stor som höjden. Skriv ett uttryck för rektangelns area.',
    variables : {
      h : 'Variabel för rektangelns höjd:',
    },
    questionLabel : 'Uttryck:',
    correctExpression : 'h*2h',
  },
  {
    description : 'I en rektangel är längden dubbelt så stor som höjden. Skriv ett uttryck för rektangelns omkrets.',
    variables : {
      h : 'Variabel för rektangelns höjd:',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '6*h',
  },
  {
    description : 'Ingolf har x kr på banken. Han får 2% ränta varje år. Skriv ett uttryck som visar hur mycket pengar han har på banken efter fem år.',
    variables : {
      x : 'hidden',
    },
    questionLabel : 'Uttryck:',
    correctExpression : 'x*1,02^5',
  },
  {
    description : 'Ingolf har 10 000 kr på banken. Han får 3,5% ränta varje år. Skriv en funktion som visar hur mycket pengar han har efter t år.',
    variables : {
      t : 'hidden',
    },
    questionLabel : 'f(t)=',
    correctExpression : '10000*1,035^t',
  },
  {
    description : 'I en rektangel är längden 7 cm längre än höjden. Skriv ett uttryck för rektangelns area.',
    variables : {
      h : 'Variabel för rektangelns höjd:',
    },
    questionLabel : 'Uttryck:',
    correctExpression : 'h*(h+7)',
  },
  {
    description : 'Röda tuggummin kostar 1,50 kr styck och svarta tuggummin kostar 1 kr styck. Skriv ett uttyck som beskriver hur mycket x röda och y svarta tuggummin kostar.',
    variables : {
      x : 'hidden',
      y : 'hidden',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '1,5*x+y',
  },
  {
    description : 'Leonard köper serietidningar. Serietidningar med röd prislapp kostar 40 kr, och de med blå prislapp kostar 45 kr styck. Leonard köper R tidningar med röd prislapp och B tidningar med blå prislapp, och betalar totalt 300 kr. Skriv en ekvation som beskriver detta.',
    variables : {
      R : 'hidden',
      B : 'hidden',
    },
    questionLabel : 'Ekvation:',
    correctExpression : '40R+45B=300',
    isEquation : true,
    freeVar : 'B',
    substitutions : {
      R : '(300-45*B)/40',
    },
  },
  {
    description : 'Ronald bygger ett staket. Stolparna han använder är 120 cm höga, och han sätter dem med 2 meters mellanrum. Skriv ett uttryck som visa hur långt staketet blir om han använder n stolpar. <em>Tänk på att det behövs två stolpar för att det ska bli något staket!</em>',
    variables : {
      n : 'hidden',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '2*(n-1)',
  },
  {
    description : 'Fröken Rosa driver en karusell. Det kostar 10 kr för vuxna att åka, och 5 kr för barn. En kväll åker V vuxna och B barn karusell, och Rosa får in totalt 450 kr. Skriv en ekvation som beskriver detta.',
    variables : {
      V : 'hidden',
      B : 'hidden',
    },
    questionLabel : 'Ekvation:',
    correctExpression : '5B+10V=450',
    isEquation : true,
    freeVar : 'V',
    substitutions : {
      B : '(450-10V)/5',
    },
  },
  {
    description : 'En dag har Yasmine x lektioner på schemat. Varje lektion är 60 minuter lång, och det är 10 minuter mellan lektionerna. Det är ingen lunchrast. Skriv ett uttryck som visar hur lång skoldagen blir (i minuter).',
    variables : {
      x : 'hidden',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '60*x+10*(x-1)',
  },
  {
    description : 'Ikeagolvet Trall kostar 180 kr per kvadratmeter. Isa ska lägga det golvet på sin balkong som är x meter lång och y meter bred. Skriv ett uttryck som visar hur mycket det kostar. (Balkongens golv är rektangulärt.)',
    variables : {
      x : 'hidden',
      y : 'hidden',
    },
    questionLabel : 'Uttryck:',
    correctExpression : '180*x*y',
  },
];
