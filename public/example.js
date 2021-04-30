var name = 'Mosh';
var name = 'liria'; // var can be declared multiple times, let cannot 

let firstName = 'Liria', lastName = 'Zhang';

const interestRate = 0.3;
console.log(interestRate);

let age = 18;
let isApproved = true;
let selectedColor = null; // type = "object"
lastName = undefined; // type = "undefined"

let person = {
    // two keys
    name: 'Mosh',
    age: 30
};
//dot Notation
person.age = 18;
//bracket Notation
person['name']= 'mary';

console.log(person.name);

function greet() {
    console.log('hello world');
}//no semicolon needed for funciton declaration

greet();

function create_person(age, name) {
    person = {age: age, name: name};
    return person;
}

console.log(create_person(18, 'Liria'));

//calculating a value
function square(number) {
    return number * number;
}
let number = square(2);
console.log(number);
console.log(square(199));