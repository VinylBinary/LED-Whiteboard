// import logo from './logo.svg';
import "./App.css";
import { useState, useEffect } from "react";
import mqtt from "mqtt";

class MQTTClientClass {
  client = mqtt.MqttClient;
  constructor() {
    const options = {
      username: "ESP_TEST",
      password: "7726060669Atiksh",
      clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
    };
    this.client = mqtt.connect(
      "wss://f0b8ce2de65140979164930ba399ba3c.s2.eu.hivemq.cloud:8884/mqtt",
      options
    );
  }
  connect() {
    this.client.on("connect", function () {
      this.client?.publish("testTopic", "mqtt react app connected");
    });
    this.client.on("error", function (error) {
      console.log("ERROR", error);
    });
  }
  send(topic, message) {
    console.log("test ");
    this.client.publish(topic, message);
  }
}

const client = new MQTTClientClass();

function Matrix({ downState, tool, mat, rows, columns, set }) {
  return (
    <div className="matrix">
      {Array(columns)
        .fill()
        .map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="row">
            {Array(rows)
              .fill()
              .map((_, colIndex) => (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  idx={`${rowIndex}-${colIndex}`}
                  downState={downState}
                  tool={tool}
                  matrix={mat}
                  setMat={set}
                />
              ))}
          </div>
        ))}
    </div>
  );
}
function Toolbar({ setTool }) {
  return (
    <div>
      <button onClick={() => setTool("pen")}>Pen</button>
      <button onClick={() => setTool("eraser")}>Eraser</button>
    </div>
  );
}
function App() {
  const rows = 4;
  const columns = 10;

  const [tool, setTool] = useState("pen");
  const [down, setDown] = useState(false);

  const [mat, setMat] = useState(
    Array(columns)
      .fill()
      .map((_, i) => Array(rows).fill(0))
  );
  useEffect(() => {
    client.connect();
    console.log("connected");
  }, []);
  useEffect(() => {
    function toHexArray(matrix){
      const out = [];
      for (let i = 0; i < matrix.length; i ++) {
        out.push("0x" + parseInt(matrix[i].flat().join(""), 2).toString(16));
      }
      console.log(typeof(out[0]))
      return out
    }
    function toHexString(matrix) {
      console.log(toHexArray(matrix))
      matrix = matrix.flat().join("");
      let matrix_new = "";
      for (let i = 0; i < matrix.length; i += 10) {
        matrix_new = matrix_new + matrix.slice(i, i + 10) + "000000";
      }
      const out = [];
      for (let i = 0; i < matrix_new.length; i += 16) {
        out.push(parseInt(matrix_new.slice(i, i + 16), 2).toString(16));
      }
  
      return "0x" + out.flat().join("");
    }

    let newMat = mat[0].map((_, colIndex) => mat.map((row) => row[colIndex]));
    console.log("This is the matrix that prints in the useEffect", newMat);
    // console.log(
    //   "This is the matrix that prints in the useEffect",
    //   binaryMatrixToHex(newMat)
    //   );

    client.send("testTopic", JSON.stringify({ hex: toHexArray(newMat) }));
    // client.send("testTopic", "test");
    console.log("published");
  }, [mat]);
  useEffect(() => {
    function handleMouseDown() {
      setDown(true);
    }
    function handleMouseUp() {
      setDown(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      <Matrix
        downState={down}
        tool={tool}
        rows={rows}
        columns={columns}
        mat={mat}
        set={setMat}
      />
      <div className="Toolbar">
        <Toolbar setTool={setTool} />
      </div>
    </>
  );
}

function Square({ idx, downState, tool, matrix, setMat }) {
  const [color, setColor] = useState("black");
  let newMatrix = matrix.slice();

  let newIdx = idx.split("-").map(Number);
  // I want to split the string into an array of two numbers

  function draw() {
    if (downState & (tool === "pen")) {
      newMatrix[newIdx[0]][newIdx[1]] = 1;
      setMat(newMatrix);
      setColor("red");
    } else if (downState & (tool === "eraser")) {
      newMatrix[newIdx[0]][newIdx[1]] = 0;
      setMat(newMatrix);
      setColor("black");
    }
  }
  function drawNoHold() {
    if (tool === "pen") {
      // let newMat = matrix.with([newIdx[0]][newIdx[1]], 1)
      newMatrix[newIdx[0]][newIdx[1]] = 1;
      setMat(newMatrix);
      setColor("red");
      // console.log(matrix)
    } else if (tool === "eraser") {
      newMatrix[newIdx[0]][newIdx[1]] = 0;
      setMat(newMatrix);
      setColor("black");
    }
  }
  return (
    <button
      className="square"
      onMouseOver={draw}
      onClick={drawNoHold}
      onMouseDown={drawNoHold}
      onTouchStart={drawNoHold}
      onTouchMove={drawNoHold}
      style={{ background: color, font: "white", fontSize: "12px" }}
    >
      {idx}
    </button>
  );
}

export default App;
