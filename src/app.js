"use strict";

require('./assets/scss/style.scss');
require.context("./", true, /^\.\/.*\.html/);

let checkName= (firstName, lastName) => {
    if(firstName !== 'Valerio' || lastName !== 'Pisapia') {
        console.log('You are not Valerio Pisapia');
    } else {
        console.log('You are Valerio Pisapia');
    }
}

checkName();

module.exports = checkName;