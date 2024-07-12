import { useState, useEffect, useRef } from "react";
import axios from "axios";
import DoublyLinkedList from "./DoublyLinkedList";
import "./historyTracker.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

const HistoryTracker = () => {
  const [history, setHistory] = useState([]);
  const [url, setUrl] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const dll = useRef(new DoublyLinkedList()).current;

  useEffect(() => {
    fetchHistory();
  }, []);
  
  useEffect(()=>{
    const preUrl=dll.goBack();
    const preEntry=history.find(entry=>entry.url==preUrl);
    if(preEntry){
      endSession(preEntry._id);
      console.log("Targeted twice");
    }
  }, [currentUrl]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/history");
      setHistory(response.data);
      dll.reset();
      response.data.forEach((entry) => dll.add(entry.url));
      setCurrentUrl(dll.getCurrentUrl());
    } catch (err) {
      console.error(err);
    }
  };

  const addHistory = async () => {
    if (url) {
      try {
        const response = await axios.post("http://localhost:5000/api/history", {
          url,
        });
        setHistory([response.data, ...history]);
        dll.add(response.data.url);
        setCurrentUrl(dll.getCurrentUrl());
        setCurrentId(response.data._id);
        setUrl("");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteHistory = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/history/${id}`);
      setHistory(history.filter((entry) => entry._id !== id));
      // Rebuild the DLL since we have removed an entry
      dll.reset();
      history
        .filter((entry) => entry._id !== id)
        .forEach((entry) => dll.add(entry.url));
      setCurrentUrl(dll.getCurrentUrl());
    } catch (err) {
      console.error(err);
    }
  };

  const updateHistory = async (id) => {
    if (editUrl) {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/history/${id}`,
          { url: editUrl }
        );
        setHistory(
          history.map((entry) => (entry._id === id ? response.data : entry))
        );
        // Rebuild the DLL since we have updated an entry
        dll.reset();
        history
          .map((entry) => (entry._id === id ? response.data : entry))
          .forEach((entry) => dll.add(entry.url));
        setCurrentUrl(dll.getCurrentUrl());
        setEditUrl("");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const goBack = () => {
    const previousUrl = dll.goBack();
    if (previousUrl) {
      endSession(currentId);
      const prevEntry=history.find(entry=>entry.url==previousUrl);
      setCurrentUrl(previousUrl);
      setCurrentId(prevEntry._id);
    }
  };

  const goForward = () => {
    const nextUrl = dll.goForward();
    if (nextUrl) {
      endSession(currentId);
      const nextEntry=history.find(entry=>entry.url==nextUrl);
      setCurrentUrl(nextUrl);
      setCurrentId(nextEntry._id);
    }
  };

  const endSession=async (id)=>{
    try{
      if(id){
        await axios.put(`http://localhost:5000/api/history/session/${id}`);
      }
    }catch(err){
      console.log(err.message);
    }
  }
  return (
    <div className="container">
      <h1>Browser History Tracker</h1>
      <div className="inner-cont">
        <TextField
          id="standard-basic"
          label="Enter URL"
          type="search"
          variant="standard"
          onChange={(e) => setUrl(e.target.value)}
          value={url}
          InputLabelProps={{
            style: { color: "white" },
          }}
          inputProps={{
            style: { color: "white" },
          }}
          sx={{
            "& .MuiInput-underline:before": { borderBottomColor: "white", marginBottom: '5px', },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "white", marginBottom: '5px',
            },
            "& .MuiInput-underline:after": { borderBottomColor: "white", marginBottom: '5px', },
          }}
        />
        <button onClick={addHistory}>Add URL</button>
        <button onClick={goBack}>Go Back</button>
        <button onClick={goForward}>Go Forward</button>
      </div>
      <div>
        <h2>Current URL: {currentUrl}</h2>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableBody>
            {history.map((entry) => (
              <TableRow
                key={entry._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <span onClick={() => setCurrentUrl(entry.url)}>
                    {entry.url} - {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <button
                    onClick={() => {
                      deleteHistory(entry._id);
                    }}
                  >
                    Delete
                  </button>
                </TableCell>
                <TableCell align="right">
                  <button >
                    <a target="_blank" href={`https://${entry.url.substring(4)}`}>Open</a>
                  </button>
                </TableCell>
                <TableCell align="right">
                  <span>{entry.duration?`Session Duration: ${entry.duration}`:'Monitoring Session'}</span>
                  {console.log(entry.duration)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default HistoryTracker;
