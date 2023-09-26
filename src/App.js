import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  makeStyles,
  AppBar,
  Toolbar,
  Typography,
  IconButton
} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';

const useStyles = makeStyles((theme) => ({
  ganado: {
    backgroundColor: 'lightgreen',
  },
  perdido: {
    backgroundColor: 'salmon',
  },
  root: {
    marginBottom: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
  fileInput: {
    display: 'none',
  },
}));

const App = () => {
  const classes = useStyles();
  const [rows, setRows] = useState(
    JSON.parse(localStorage.getItem("rows")) || []
  );
  const [bankTotal, setBankTotal] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({
    estado: "",
    nombre: "",
    apuestaTotal: "",
    gananciaTotal: "",
    bankTotal: 0,
  });

  useEffect(() => {
    localStorage.setItem("rows", JSON.stringify(rows));
  }, [rows]);

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Ganada':
        return classes.ganado;
      case 'Perdida':
        return classes.perdido;
      default:
        return '';
    }
  };

  const extractInfo = (text) => {
    const lines = text.split("\n");
    const estado = lines[0].split(" ")[1];
    const nombre = lines[4];
    const apuestaTotal = parseInt(lines[lines.length - 3].split(": ")[1], 10);
    const gananciaTotal = parseInt(lines[lines.length - 2].split(": ")[1], 10);
    return { estado, nombre, apuestaTotal, gananciaTotal };
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      Tesseract.recognize(file, "eng", {
        logger: (info) => console.log(info),
      }).then(({ data: { text } }) => {
        const info = extractInfo(text);
        setRows((prevRows) => [...prevRows, info]);
        const newBankTotal =
          bankTotal + parseInt(info.gananciaTotal) - parseInt(info.apuestaTotal);
        setBankTotal(newBankTotal);
      });
    }
  };

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Tickets");
    XLSX.writeFile(wb, "tickets.xlsx");
  };

  const handleDelete = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleEdit = (index) => {
    setEditData(rows[index]);
    setEditingIndex(index);
  };

  const handleSave = (index) => {
    const newRows = [...rows];
    newRows[index] = editData;
    setRows(newRows);
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  return (
    <div>
      <AppBar position="static" className={classes.root}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            App de Tickets
          </Typography>
          <input
            accept="image/*"
            className={classes.fileInput}
            id="contained-button-file"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="default" component="span">
              Subir Imagen
            </Button>
          </label>
          <Button color="inherit" onClick={handleExcelExport}>Exportar como Excel</Button>
        </Toolbar>
      </AppBar>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apuesta Total</TableCell>
              <TableCell>Ganancia Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Bank Total</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      name="nombre"
                      value={editData.nombre}
                      onChange={handleInputChange}
                    />
                  ) : (
                    row.nombre
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      name="apuestaTotal"
                      value={editData.apuestaTotal}
                      onChange={handleInputChange}
                    />
                  ) : (
                    row.apuestaTotal
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      name="gananciaTotal"
                      value={editData.gananciaTotal}
                      onChange={handleInputChange}
                    />
                  ) : (
                    row.gananciaTotal
                  )}
                </TableCell>
                <TableCell className={getEstadoClass(row.estado)}>
                  {editingIndex === index ? (
                    <TextField
                      name="estado"
                      value={editData.estado}
                      onChange={handleInputChange}
                    />
                  ) : (
                    row.estado
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      name="bankTotal"
                      value={editData.bankTotal}
                      onChange={handleInputChange}
                    />
                  ) : (
                    bankTotal
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <IconButton color="primary" onClick={() => handleSave(index)}>
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton color="primary" onClick={() => handleEdit(index)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton color="secondary" onClick={() => handleDelete(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default App;
