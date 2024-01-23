import SerialPort from "serialport"; // Importing SerialPort class
import mysql from "mysql2";
import { Server } from "socket.io";

// Defining a readline parser
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({
  delimiter: "\r\n",
});

// opening the port
const port = new SerialPort("/dev/cu.usbmodem2017_2_251", {
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
});

// Pipes the data from the serial port to the parser
port.pipe(parser);

const pool = mysql.createPool({
  host: "34.93.66.68",
  user: "root",
  password: "Shreeram@1",
  database: "arduino_data",
}).promise();

function getDate() {
  return new Date().toLocaleString();
}

async function postData(data) {
  const result = await pool.query(`INSERT INTO READINGS VALUES(?, ?)`, [getDate(), data]);
  console.log(result);
}

const io = new Server(3000, {
  cors: {
    origin: "http://127.0.0.1:5000",
    methods: ["GET", "POST"],
    transport: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});

// listening for a connection from client
io.on("connection", (socket) => {
  console.log(`listening...`);
})

// Event-Listening for data on the parser
parser.on("data", (data) => {
  console.log(`Current Value of Potentiometer: ${data}`);
  postData(data);
  io.emit('data', data);
});