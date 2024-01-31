import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import InputBase from '@mui/material/InputBase' 
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useStyles } from './../styles/NotesFormStyle'
import { useSelector, useDispatch } from 'react-redux'
import { toggleNotesForm, updateNote, addNote, setNotes, state, fetchNotes } from './../redux/notesReducer'
import notesCategories from './../util/NotesCategories'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // for snow theme
import { unwrapResult } from '@reduxjs/toolkit';
import { createUpdateNote } from './../redux/notesReducer';


export default function NotesForm() {
  const initialFormState = { title: '', description: '', category: '' };
  const classes = useStyles();
  const isOpened = useSelector((store) => store.notes.showNotesForm);
  const noteToEdit = useSelector((store) => store.notes.noteToEdit);
  const [form, setForm] = useState(initialFormState);
  const dispatch = useDispatch();

  useEffect(() => {
    if (noteToEdit) {
      // Set form state with the note to be edited
      setForm({
        ...noteToEdit,
        content: noteToEdit.content, // Make sure to match the property names
      });
    }
    console.log("noteToEdit",noteToEdit);
    console.log("form",form);
    dispatch(fetchNotes());
    console.log(state)
  }, [noteToEdit]);

  useEffect(() => {
    console.log('fetching notes UseEffect');
    dispatch(fetchNotes());
  }, [dispatch]);
  

  const handleClose = () => {
    setForm(initialFormState);
    dispatch(toggleNotesForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let actionResult;
      if (noteToEdit) {
        // Update note
        actionResult = await dispatch(updateNote({
          ...form,
          id: noteToEdit.id,
        }));
      } else {
        // Create note
        actionResult = await dispatch(addNote({
          ...form,
        }));
      }
      // Get the result from the dispatched action
      const result = unwrapResult(actionResult);
      // Fetch all notes again to refresh the list
      const response = await fetch('/api/notes');
      const data = await response.json();
      dispatch(setNotes(data));
    } catch (error) {
      console.error('Error processing note:', error);
    }
    handleClose();
  };
  
  

  return (
    <div>
      <Dialog
        open={isOpened}
        onClose={handleClose}
        aria-labelledby="notes-dialog-title"
        aria-describedby="notes-dialog-form"
        className={classes.root}
      >
        <DialogTitle id="notes-dialog-title" disableTypography>
          {noteToEdit ? 'Update note' : 'Add note'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <InputBase
                  placeholder="Add title…"
                  className={classes.input}
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required={true}
                />
                <ReactQuill
                    value={form.content ? form.content : ''} 
                    onChange={(value) => setForm({ ...form, content: value })}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'image'],
                        ['clean'],
                      ],
                    }}
                /> 
              </Grid>

              <Grid item xs={12} sm={4} style={{display:"none"}}>
                <Select
                  value={form.category || ''}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  displayEmpty
                  className={classes.input}  
                >
                  <MenuItem value="" disabled>
                    Select category
                  </MenuItem>
                  {Object.keys(notesCategories).map((category, index) => (
                    <MenuItem value={category} key={index} selected>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Grid container spacing={3} className={classes.formActionButtons}>
              <Grid item xs={12}>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button type="submit" color="primary" autoFocus>
                  {noteToEdit ? 'Update' : 'Add'}
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
