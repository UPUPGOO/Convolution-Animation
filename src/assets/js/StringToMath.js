//Class for operators
function Operator(input) {
  this.operator = input;
  if (!input) {
    console.log("Operator has no input.");
  }

  this.solve = function(segment1, segment2, x) {
    let v1 = segment1.coefficient;
    if (segment1.type=="letiable") {
      v1 = x;
    }
    let v2 = segment2.coefficient;
    if (segment2.type=="letiable") {
      v2 = x;
    }
    if (this.operator=="+") {
      return new Segment(v1 + v2);
    } else if (this.operator=="-") {
      return  new Segment(v1 - v2);
    } else if  (this.operator=="*") {
      return  new Segment(v1 * v2);
    } else if (this.operator=="/") {
      return  new Segment(v1 / v2);
    } else if (this.operator=="^") {
      return  new Segment(Math.pow(v1, v2));
    }
  };
}

//Class for special functions
function MathFunction(input) {
  this.f=input;
  if (!input) {
    console.log("Math function has no input.");
  }

  this.solve = function(segment) {
    let v = segment.coefficient;
    if (this.f=="sin") {
      return new Segment(Math.sin(v));
    } else if (this.f=="cos") {
      return new Segment(Math.cos(v));
    } else if (this.f=="tan") {
      return new Segment(Math.tan(v));
    } else if (this.f=="asin") {
      return new Segment(Math.asin(v));
    } else if (this.f=="acos") {
      return new Segment(Math.acos(v));
    } else if (this.f=="atan") {
      return new Segment(Math.atan(v));
    } else if (this.f=="abs") {
      return new Segment(Math.abs(v));
    }
  };
}

//Class for a segment of math (a container)
function Segment(input) {
  this.sections = [];
  this.type="section";
  this.operator=0;
  this.coefficient=0;
  this.mathFunction=0;
  this.letiable="";

  let removeBrackets = function(value) {
    if (!value) return "";

    //While there are brackets around the string
    while (value.substr(0, 1)=="(" && value.substr(value.length-1, 1)==")") {
      let openBrackets=1;

      //See if the end bracket closes the opening bracket or not
      let i=1;
      for (i=1; i<value.length&&openBrackets>0; i++) {
        if (value.substr(i, 1)=="(") openBrackets++;
        if (value.substr(i, 1)==")") openBrackets--;
      }
      i-=1;

      //If it corresponds to different brackets, do nothing
      if (openBrackets!==0 || i!=value.length-1) {
        break;

      //Otherwise, remove the brackets, continue loop to see if there are more
      } else {
        value=value.substring(1, value.length-1);
      }
    }

    return value;
  };

  let findLast = function(operator, value) {

    //Keep searching for the next last sign if the one found is within brackets
    let inBrackets=true;
    let index=-1;
    if (operator!="^") {
      index=value.lastIndexOf(operator);
    } else {
      index=value.indexOf(operator); //Look for the first instead of last if it's an exponent
    }
    let operators="+-/*^";
    while (inBrackets) {
      let openBrackets=0;

      //Find how many brackets are opened or closed at a given point in the string
      for (let i=0; i<value.length; i++) {
        if (value.substr(i, 1)=="(") {
          openBrackets++;
        } else if (value.substr(i, 1)==")") {
          openBrackets--;
        }

        if (i==index) {

          //If no brackets are open (and if the operator is actually - and not just a minus sign), break the loop.
          if ((openBrackets===0 && (operator!="-" || (i>0 && operators.indexOf(value.substr(i-1, 1))==-1) || i===0)) || (openBrackets==1 && operator=="(")) {
            inBrackets=false;
            break;

          //Otherwise, find the next operator, and loop through again to see if that one is in brackets
          } else {
            if (operator!="^") {
              index = value.substring(0, index).lastIndexOf(operator);
            } else {
              let nextOperator = value.substring(index+1).indexOf(operator);
              if (nextOperator==-1) {
                index=-1;
              } else {
                index = (index+1+value.substring(index+1).indexOf(operator));
              }
            }
          }
        }
      }

      //If no more operators are found, break the loop
      if (index==-1) {
        inBrackets=false;
      }
    }
    return index;
  };

  let findLastTrig = function(trig, value) {
    let matches=0;
    let index=-1;
    let r=0;
    if (trig=="sin") {
      r=/(a)?sin/g;
    } else if (trig=="cos") {
      r=/(a)?cos/g;
    } else if (trig=="tan") {
      r=/(a)?tan/g;
    } else {
      return -1;
    }
    for (matches=r.exec(value); matches; matches=r.exec(value)) if (RegExp.$1 != "a") index=matches.index;
    let inBrackets=true;
    while (inBrackets && index!=-1) {
      let openBrackets=0;

      //Find how many brackets are opened or closed at a given point in the string
      for (let i=0; i<value.length; i++) {
        if (value.substr(i, 1)=="(") {
          openBrackets++;
        } else if (value.substr(i, 1)==")") {
          openBrackets--;
        }

        if (i==index) {

          //If no brackets are open (and if the operator is actually - and not just a minus sign), break the loop.
          if (openBrackets===0) {
            inBrackets=false;
            break;

          //Otherwise, find the next operator, and loop through again to see if that one is in brackets
          } else {
            let sub = value.substring(0, index);
            index=-1;
            for (matches=r.exec(sub); matches; matches=r.exec(sub)) if (RegExp.$1 != "a") index=matches.index;
          }
        }
      }

      //If no more operators are found, break the loop
      if (index==-1) {
        inBrackets=false;
      }
    }
    return index;
  };

  //Specifically for finding brackets that can be used for multiplication
  let findMultiplicationBrackets = function(value) {

    //Keep searching for the next last sign if the one found is within brackets
    let inBracketsOpen=true;
    let inBracketsClosed=true;
    let indexOpen=-1;
    let indexClosed=-1;
    let operators="+-/*^sincostanabs";
    
    indexOpen=value.lastIndexOf("(");
    indexClosed=value.lastIndexOf(")");

    while (inBracketsOpen || inBracketsClosed) {
      let openBrackets=0;

      //Find how many brackets are opened or closed at a given point in the string
      for (let i=0; i<value.length; i++) {
        if (value.substr(i, 1)=="(") {
          openBrackets++;
        } else if (value.substr(i, 1)==")") {
          openBrackets--;
        }

        if (i==indexOpen && inBracketsOpen) {

          if (openBrackets==1 && i!==0 && operators.indexOf(value.substr(i-1, 1))==-1) {
            inBracketsOpen=false;

          //Otherwise, find the next operator, and loop through again to see if that one is in brackets
          } else {
            indexOpen = value.substring(0, indexOpen).lastIndexOf("(");
          }
        }

        if (i==indexClosed && inBracketsClosed) {

          if (openBrackets===0 && i<value.length-1 && operators.indexOf(value.substr(i+1, 1))==-1) {
            inBracketsClosed=false;

          //Otherwise, find the next operator, and loop through again to see if that one is in brackets
          } else {
            indexClosed = value.substring(0, indexClosed).lastIndexOf(")");
          }
        }
      }

      //If no more operators are found, break the loop
      if (indexOpen==-1) {
        inBracketsOpen=false;
      }
      if (indexClosed==-1) {
        inBracketsClosed=false;
      }
    }

    if (indexClosed>indexOpen && indexClosed!=-1) {
      return indexClosed;
    } else {
      return indexOpen;
    }
  };

  //Recursively solve children
  this.solve = function(x) {
    if (!x) x=0;
    if (this.type=="value") {
      return this;
    } else if (this.type=="letiable") {
      return new Segment(x);
    } else if (this.type=="function") {
      return this.mathFunction.solve(this.sections[0].solve(x));
    } else {
      if (this.sections.length==1) {
        return this.sections[0].solve(x);
      } else if (this.sections.length==2) {
        return this.operator.solve(this.sections[0].solve(x), this.sections[1].solve(x), x);
      }
    }
  };

  //Outputs the final answer
  this.result = function(x) {
    return this.solve(x).coefficient;
  }.bind(this);

  this.display = function(x) {
    if (this.type=="value") return this.coefficient;
    if (this.type=="letiable") return "x";
    if (this.type=="function") return this.mathFunction.f;
    let str = "<div class='group'>";
    for (let i=0; i<this.sections.length; i++) {
      str+=this.sections[i].display(x);
      if (i===0 && this.operator) {
        str+="<div class='group operator'>" + this.operator.operator + "</div>";
      }
    }
    str+="<div class='answer'>= " + this.solve().coefficient + "</div>";
    str+="</div>";
    return str;
  };



  //constructor
  if (input!==undefined) {
    if (typeof(input)=="string") {
      //Remove excess whitespace
      input = input.replace(/\s/g, "");

      //get rid of unnecessary brackets surrounding the section
      input = removeBrackets(input);
      
      //Find the last instance of each operator in the string
      let addition = findLast("+", input);
      let subtraction = findLast("-", input);
      let division = findLast("/", input);
      let exponent = findLast("^", input); //Find the first exponent, since those work in reverse
      let bracket1 = findLast("(", input);

      let sin = findLastTrig("sin", input);
      let cos = findLastTrig("cos", input);
      let tan = findLastTrig("tan", input);
      let asin = findLast("asin", input);
      let acos = findLast("acos", input);
      let atan = findLast("atan", input);
      let abs = findLast("abs", input);
      let multiplication = findLast("*", input);
      let multiplication2 = findMultiplicationBrackets(input); //Find brackets that are the same as multiplication
      let functionMultiplication = -1;
      if (sin>multiplication) functionMultiplication=sin;
      if (cos>multiplication) functionMultiplication=cos;
      if (tan>multiplication) functionMultiplication=tan;
      if (asin>multiplication) functionMultiplication=asin;
      if (acos>multiplication) functionMultiplication=acos;
      if (atan>multiplication) functionMultiplication=atan;
      if (abs>multiplication) functionMultiplication=abs;

      //Push back each half of the equation into a section, in reverse order of operations
      if (addition != -1 && (subtraction == -1 || addition>subtraction)) {
        this.sections.push(new Segment(input.substring(0, addition)));
        this.sections.push(new Segment(input.substring(addition+1)));
        this.operator = new Operator("+");
      } else if (subtraction != -1) {
        if (subtraction>0) {
          this.sections.push(new Segment(input.substring(0, subtraction)));
        } else {
          this.sections.push(new Segment(0));
        }
        this.sections.push(new Segment(input.substring(subtraction+1)));
        this.operator = new Operator("-");
      } else if (functionMultiplication >0 && functionMultiplication > multiplication && functionMultiplication > division) {
        this.sections.push(new Segment(input.substring(0, functionMultiplication)));
        this.sections.push(new Segment(input.substring(functionMultiplication)));
        this.operator = new Operator("*");
      } else if (multiplication2 != -1 && (division == -1 || multiplication>division) && (multiplication == -1 || multiplication2>multiplication)) {
        this.sections.push(new Segment(input.substring(0, multiplication2)));
        this.sections.push(new Segment(input.substring(multiplication2)));
        this.operator = new Operator("*");
      } else if (multiplication != -1 && (division == -1 || multiplication>division)) {
        this.sections.push(new Segment(input.substring(0, multiplication)));
        this.sections.push(new Segment(input.substring(multiplication+1)));
        this.operator = new Operator("*");
      } else if (division != -1) {
        this.sections.push(new Segment(input.substring(0, division)));
        this.sections.push(new Segment(input.substring(division+1)));
        this.operator = new Operator("/");
      } else if (exponent != -1) {
        this.sections.push(new Segment(input.substring(0, exponent)));
        this.sections.push(new Segment(input.substring(exponent+1)));
        this.operator = new Operator("^");
      } else if (sin != -1 && (cos == -1 || sin>cos) && (tan == -1 || sin>tan) && (asin == -1 || sin>asin) && (acos == -1 || sin>acos) && (atan == -1 || sin>atan) && (abs == -1 || sin>abs)) {
        this.sections.push(new Segment(input.substring(sin+3)));
        this.mathFunction = new MathFunction("sin");
        this.type = "function";
      } else if (cos != -1 && (tan == -1 || cos>tan) && (asin == -1 || cos>asin) && (acos == -1 || cos>acos) && (atan == -1 || cos>atan) && (abs == -1 || cos>abs)) {
        this.sections.push(new Segment(input.substring(cos+3)));
        this.mathFunction = new MathFunction("cos");
        this.type = "function";
      } else if (tan != -1 && (asin == -1 || tan>asin) && (acos == -1 || tan>acos) && (atan == -1 || tan>atan) && (abs == -1 || tan>abs)) {
        this.sections.push(new Segment(input.substring(tan+3)));
        this.mathFunction = new MathFunction("tan");
        this.type = "function";
      } else if (asin != -1 && (acos == -1 || asin>acos) && (atan == -1 || asin>atan) && (abs == -1 || asin>abs)) {
        this.sections.push(new Segment(input.substring(asin+4)));
        this.mathFunction = new MathFunction("asin");
        this.type = "function";
      } else if (acos != -1 && (atan == -1 || acos>atan) && (abs == -1 || acos>abs)) {
        this.sections.push(new Segment(input.substring(acos+4)));
        this.mathFunction = new MathFunction("acos");
        this.type = "function";
      } else if (atan != -1 && (abs == -1 || atan>abs)) {
        this.sections.push(new Segment(input.substring(atan+4)));
        this.mathFunction = new MathFunction("atan");
        this.type = "function";
      } else if (abs != -1) {
        this.sections.push(new Segment(input.substring(abs+3)));
        this.mathFunction = new MathFunction("abs");
        this.type = "function";
      } else if (bracket1 != -1) {
        let openBrackets=1;
        for (let i=bracket1+1; i<input.length&&openBrackets>0; i++) {
          if (input.substr(i, 1)=="(") openBrackets++;
          if (input.substr(i, 1)==")") openBrackets--;
        }
        if (openBrackets===0) {
          let bracket2=i-1;
          if (bracket1>0) this.sections.push(new Segment(input.substring(0, bracket1)));
          if (bracket2-bracket1!=1) this.sections.push(new Segment(input.substring(bracket1+1, bracket2)));
          if (bracket2!=input.length-1) this.sections.push(new Segment(input.substring(bracket2+1)));
          this.operator = new Operator("*");
        } else {
          console.log("Brackets nesting error: " + input);
        }

      //If there are no operators, just push the input itself
      } else {
        let xLocation=input.toLowerCase().indexOf("x");
        if (xLocation!=-1) {
          if (xLocation>0) {
            this.sections.push(new Segment(input.substring(0, xLocation)));
            this.sections.push(new Segment("x"));
            this.operator=new Operator("*");
          } else {
            this.letiable="x";
            this.type="letiable";
          }
        } else {
          this.coefficient = parseFloat(input);
          this.type = "value";
        }
      }
    } else if (typeof(input)=="number") {
      this.coefficient = input;
      this.type = "value";
    }
  } else {
    console.log("Segment has no input.");
  }
}

module.exports=Segment;

// console.log(new Segment("sinx").result(Math.PI/2).toFixed(2));//使用示例
