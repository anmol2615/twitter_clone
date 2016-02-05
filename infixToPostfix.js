/**
 * Created by anmol on 3/2/16.
 */
'use strict';
var postfix = '',
    num = '',
    stack = [''],
    input = '27*35+4';
var processStack = function(operator1,operator2){
    if(!operator2||
        ((operator1==='*'||operator1==='/')&&operator2 === '^')||
        (operator1==='+'||operator1==='-'))
    {
        stack.push(operator1);
        postfix = postfix + operator2;
    }
    else
        stack.push(operator2,operator1);
};
var infixToPostfix = function(infix){
    for(var index = 0 ; index<infix.length ; index++)
    {

        while(!!parseInt(infix[index])){
                postfix = postfix + infix[index];
                index++;
            }
        if(infix[index]=='+' || infix[index]=='-' || infix[index]=='*' || infix[index]=='/' )
            processStack(infix[index],stack.pop());
    }
    while(stack.length)
    {
        postfix = postfix + stack.pop();
    }
    console.log(postfix);
};
infixToPostfix(input.split(""));