matrix1 =  [
  [1, 1, 1],
  [1, 1, 50],
  [51, 51, 51],
  [61, 61, 50],


]

var matrix2 = []
var inputsM = []


function setup(){
  createCanvas(windowWidth,windowHeight, WEBGL);

  for(let cont=0;cont<3;cont++){
    for(let cont2=0;cont2<3;cont2++){
      let input_aux = createInput()
      input_aux.position(windowWidth-(80*4)+cont*40,cont2*50)
      input_aux.size(25,15);
      inputsM.push(input_aux)
    }
  }

  for(let cont =0 ;cont<5;cont++){
    matrix1.push([Math.floor(Math.random() *200),
                    Math.floor(Math.random() *200),
                    Math.floor(Math.random() *200)
    ])
  }

  button1 = createButton('Multiplicar');
  button1.position(inputsM[6].x, inputsM[6].y+150);
  button1.mousePressed(multiply);
}

function draw(){
  background(30);
  rotateY(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  plotMatrix(matrix1,"red")
}

function plotMatrix(matrix,color){

  let aux = [];
  
  for (let l in matrix){
    if(aux.length > 0){
      stroke(color);
      line(aux[0],aux[1],aux[2],matrix[l][0],matrix[l][1],matrix[l][2])
    }
    aux = matrix[l]
  }
}

function completeZero(m){
  if(m[0].length != m.length){
    if(m.length%2 != 0){
      //m.push([0,0,0])
    }
    for (let interator in m){
      for(let aux = 0;aux<m.length-3;aux++){
        m[interator].push(0)
      }
    }
  }
  return m;
}



function multiply(){
  matrix2 = [];
  let interator =0;
  for(let cont=0;cont<3;cont++){
    let aux = []
    for(let cont2=0;cont2<3;cont2++){
      aux.push(inputsM[interator].value())
      interator++; 
    }
    matrix2.push(aux)
  }
  while(matrix2.length < matrix1.length){
    matrix2.push([0,0,0]);
  }
  fetchWasm();
}

function fetchWasm(){
  let arrayDataToPass = matrix1
  let arrayDataToPass2 = matrix2
  arrayDataToPass = completeZero(matrix1)  
  len1 = arrayDataToPass.length * arrayDataToPass[0].length;
  arrayDataToPass2 = completeZero(matrix2,len1)
  len2 = arrayDataToPass2.length * arrayDataToPass2[0].length;

    let typedArray = new Float64Array(len1)
    let typedArray2 = new Float64Array(len2)

    let cont = 0
    for (let i=0; i<Math.sqrt(len1); i++) {
      for (let j=0; j<Math.sqrt(len1); j++) {
        typedArray[cont] = arrayDataToPass[i][j]
        typedArray2[cont] = arrayDataToPass2[i][j]
        cont++
      }
    }

    // Allocate some space in the heap for the data (making sure to use the appropriate memory size of the elements)
    let buffer = Module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT)
    let buffer2 = Module._malloc(typedArray2.length * typedArray2.BYTES_PER_ELEMENT)

    // Assign the data to the heap - Keep in mind bytes per element
    Module.HEAPF64.set(typedArray, buffer >> 3)
    Module.HEAPF64.set(typedArray2, buffer2 >> 3)

    
    var result = Module.ccall('myFunction', // name of C function
        ['number'], // return type
        ['number', 'number','number', 'number','number', 'number'],
        [buffer ,Math.sqrt(len1),Math.sqrt(len1),buffer2,Math.sqrt(len1),Math.sqrt(len1)]
        );

    var arrayData = []
    for (let v=0; v<len1; v++) {
        arrayData.push(Module.HEAPF64[result/Float64Array.BYTES_PER_ELEMENT+v])
    }

    arrayData = arrayData.reduce(function (rows, key, index) { 
      return (index % Math.sqrt(len1) == 0 ? rows.push([key]) 
        : rows[rows.length-1].push(key)) && rows;
    }, []);


    console.log("---------------------------\\--------------------")
    console.log(arrayData)
    console.log("---------------------------\\--------------------")
    matrix1 = arrayData


    Module._free(buffer);
    Module._free(buffer2);      
}