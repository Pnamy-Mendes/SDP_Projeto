import { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Note from './Note';
import NoNotesIllustration from './NoNotesIllustration';
import PendingNotes from './PendingNotes';
import { useSelector, useDispatch } from 'react-redux';
import { setNotes, editNote, deleteNote } from './../redux/notesReducer';

export default function NotesList() {
  const { sorted, pending } = useSelector((state) => state.notes);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/notes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // to include cookies with the request
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }

        const notes = await response.json();
        console.log("notes fetch on notesList",notes)
        dispatch(setNotes(notes)); // Dispatch an action to update your state with the fetched notes
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    })();
  }, [dispatch]);

  if (pending) return <PendingNotes />;

  return (
    <Grid container spacing={2}>
      {sorted.length === 0 ? (
        <NoNotesIllustration />
      ) : (
        sorted.map((note) => (
          <Grid item xs={12} sm={6} key={note.id}>
            <Note note={note} onEdit={() => dispatch(editNote(note.id))} onDelete={() => dispatch(deleteNote(note.id))} />
          </Grid>
        ))
      )}
    </Grid>
  );
}
