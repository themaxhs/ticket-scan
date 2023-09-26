import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  IconButton,
  Grid,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GetAppIcon from "@material-ui/icons/GetApp";

const useStyles = makeStyles((theme) => ({
  ganado: {
    backgroundColor: "lightgreen",
  },
  perdido: {
    backgroundColor: "salmon",
  },
  root: {
    marginBottom: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
  fileInput: {
    display: "none",
  },
  button: {
    margin: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.7rem",
    },
  },
}));

const App = () => {
  const classes = useStyles();
  const [rows, setRows] = useState(
    JSON.parse(localStorage.getItem("rows")) || []
  );
  const [open, setOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
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
      case "Ganada":
        return classes.ganado;
      case "Perdida":
        return classes.perdido;
      default:
        return "";
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
    const files = e.target.files;
    if (files.length > 0) {
      for (let file of files) {
        Tesseract.recognize(file, "eng", {
          logger: (info) => console.log(info),
        }).then(({ data: { text } }) => {
          const info = extractInfo(text);
          setRows((prevRows) => [...prevRows, info]);
          const newBankTotal =
            bankTotal +
            parseInt(info.gananciaTotal) -
            parseInt(info.apuestaTotal);
          setBankTotal(newBankTotal);
        });
      }
    }
  };

  const handlePDFExport = () => {
    const doc = new jsPDF();
    autoTable(doc, { html: "#ticket-table" });
    doc.save("tickets.pdf");
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

  const handleOpen = (index) => {
    setDeleteIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteIndex(null);
  };

  const handleConfirmDelete = () => {
    handleDelete(deleteIndex);
    handleClose();
  };

  return (
    <div>
      <AppBar position="static" className={classes.root}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            App de Tickets
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <input
                accept="image/*"
                className={classes.fileInput}
                id="contained-button-file"
                type="file"
                onChange={handleImageUpload}
                multiple
              />

              <label htmlFor="contained-button-file">
                <Button
                  variant="contained"
                  color="secondary"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  className={classes.button}
                >
                  Subir Imagen
                </Button>
              </label>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleExcelExport}
                startIcon={<GetAppIcon />}
                className={classes.button}
              >
                Exportar como Excel
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={handlePDFExport}
                startIcon={<GetAppIcon />}
                className={classes.button}
              >
                Exportar como PDF
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <TableContainer component={Paper}>
        <Table id="ticket-table">
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
                    <IconButton
                      color="primary"
                      onClick={() => handleSave(index)}
                    >
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(index)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    color="secondary"
                    onClick={() => handleOpen(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"¿Estás seguro?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de eliminar?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default App;
