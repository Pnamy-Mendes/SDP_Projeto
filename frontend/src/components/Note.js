import React, { useState } from 'react';
import { Card, CardContent, Checkbox, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { toggleNoteStatus, deleteNote, fetchNotes, setNotes } from './../redux/notesReducer';
import { editNote } from './../redux/notesReducer';


function Note({ note }) {
  const [checked, setChecked] = useState(note.completed);
  const dispatch = useDispatch();

  const handleToggleStatus = () => {
    setChecked(!checked);
    dispatch(toggleNoteStatus(note.id));
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteNote(note.id));
      // Fetch all notes again to refresh the list
      const response = await fetch('/api/notes');
      const data = await response.json();
      dispatch(setNotes(data));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  

  const handleEdit = () => {
    dispatch(editNote(note));
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Checkbox checked={checked} onChange={handleToggleStatus} />
        <Typography variant="h5">{note.title}</Typography>
        <Typography color="textSecondary">{note.content}</Typography>
        <Typography color="textSecondary">{note.date}</Typography>
        <IconButton aria-label="edit" onClick={handleEdit}>
          <EditIcon />
        </IconButton>
        <IconButton aria-label="delete" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
}

export default Note;
