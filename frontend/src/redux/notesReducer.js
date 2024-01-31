// In notesReducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching notes
export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
  const response = await fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  const notes = await response.json();
  return notes;
});

export const addNote = createAsyncThunk('notes/addNote', async (noteData, { getState }) => {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  const newNote = await response.json();
  return newNote;
});


// For example, after the delete operation, the backend should return a success response.
export const deleteNote = createAsyncThunk('notes/deleteNote', async (noteId, { getState, rejectWithValue }) => {
  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
    // You might need to adjust this depending on how your API works
    return noteId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});


export const updateNote = createAsyncThunk('notes/updateNote', async (noteData, { getState }) => {
  const response = await fetch(`/api/notes/${noteData.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // to include cookies with the request
    body: JSON.stringify({
      title: noteData.title,
      content: noteData.content,
      category: noteData.category,
      completed: noteData.completed,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update note');
  }

  const updatedNote = await response.json();
  return updatedNote;
});

const initialState = {
  all: [], // Initialize all and sorted as empty arrays
  sorted: [],
  // ...other properties
};

// Async thunk for fetching categories
/* export const fetchCategories = createAsyncThunk('notes/fetchCategories', async (_, { getState }) => {
  const response = await fetch('/api/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const categories = await response.json();
  return categories;
}); */


export const slice = createSlice({
  name: 'notes',
  initialState: {
    all: [],
    sorted: [],
    searchValue: '',
    activeCategory: 'All',
    showNotesForm: false,
    noteToEdit: undefined,
    pending: true,
    error: null,
  },
  reducers: {
    setSearchValue: (state, action) => {
      state.searchValue = action.payload
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload
      localStorage.setItem('activeCategory', action.payload)
    },
    toggleNotesForm: (state) => {
      state.showNotesForm = !state.showNotesForm
      state.noteToEdit = undefined
    },
    createUpdateNote: (state, action) => {
      const { id, ...noteData } = action.payload;
      const existingIndex = state.all.findIndex(note => note.id === id);
  
      if (existingIndex !== -1) {
        // Update existing note
        state.all[existingIndex] = { ...state.all[existingIndex], ...noteData };
      } else {
        // Add new note
        // The backend should assign a unique ID for the new note.
        state.all.push({ id, ...noteData });
      }
  
      // Update sorted to reflect the changes in all
      state.sorted = [...state.all];
    },
    /* },
    createUpdateNote: (state, action) => {
      const date = now()
      if (!action.payload.id) {
        // create new note
        /* const id = generateNoteId(state.all) 
        const completed = false
        state.all.push({  completed, /* date,  ...action.payload })
      } else {
        // update existing note
        state.all.forEach((note, index) => {
          if (note.id === action.payload.id) {
            const updatedNote = { ...note, ...action.payload }
            updatedNote.date = date
            state.all[index] = updatedNote
          }
        })
      }
    } ,*/
    editNote: (state, action) => {
      state.noteToEdit = action.payload;
      state.showNotesForm = true;
    },
    toggleNoteStatus: (state, action) => {
      state.all.forEach((note) => {
        if (note.id === action.payload) {
          // note.date = now()
          note.completed = !note.completed
        }
      })
    },
    /* deleteNote: (state, action) => {
      state.all = state.all.filter(({ id }) => id !== action.payload)
    }, */
    sortAndFilter: (state) => {
      let sortedNotes = [...state.all].sort((a, b) => {
        if (a.completed === b.completed)
          return new Date(b.date) - new Date(a.date)
        return b.completed ? -1 : 1
      })
    
      console.log("sorted", sortedNotes)
    
      if (state.activeCategory !== 'All') {
        sortedNotes = sortedNotes.filter(
          (n) => n.category === state.activeCategory
        )
      }
    
      console.log("searchValue", state.searchValue)
      if (state.searchValue) {
        sortedNotes = sortedNotes.filter(({ title, description }) => {
          // Check if title and description are defined before using toLowerCase()
          const lowerCaseTitle = title ? title.toLowerCase() : '';
          const lowerCaseDescription = description ? description.toLowerCase() : '';
    
          return lowerCaseTitle.includes(state.searchValue.toLowerCase()) ||
                 lowerCaseDescription.includes(state.searchValue.toLowerCase());
        });
      }
    
      state.sorted = sortedNotes
    },
    saveNotes: (state) => {
      localStorage.setItem('notes', JSON.stringify(state.all))
    },
    setNotes: (state, action) => {
      state.all = action.payload;
      state.sorted = action.payload; // Sort/filter as needed
      state.pending = false;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    }, 
    /* getNotes: (state) => {
      const savedNotes = localStorage.getItem('notes')
      state.all = savedNotes ? JSON.parse(savedNotes) : []
      state.activeCategory = localStorage.getItem('activeCategory') ?? 'All'
      state.pending = false
    }, */
    /* getNotes: (state) => {
      /* state.pending = true; // Set pending to true while fetching 
      const savedNotes = fetchNotes()
      console.log("fetched notes",savedNotes);
      state.all = savedNotes ? JSON.parse(savedNotes) : []
      state.activeCategory = localStorage.getItem('activeCategory') ?? 'All'
      state.pending = false 
      console.log("fetched notes",state.all);
    }, */
    extraReducers: { 
      [fetchNotes.fulfilled]: (state, action) => {
        state.all = action.payload;
        state.sorted = action.payload;
        state.pending = false;
      }, 
      [updateNote.fulfilled]: (state, action) => {
        const index = state.all.findIndex((note) => note.id === action.payload.id);
        if (index !== -1) {
          state.all[index] = action.payload;
        }
        state.sorted = [...state.all];
      },
  
      [addNote.fulfilled]: (state, action) => {
        state.all.push(action.payload);
        state.sorted = [...state.all];
      },
  
      [deleteNote.fulfilled]: (state, action) => {
        const id = action.payload;
        state.all = state.all.filter((note) => note.id !== id);
        state.sorted = state.all.filter((note) => note.category === state.activeCategory);
      },
    },
  }
})

/* const generateNoteId = (notes) => {
  return (
    Math.max.apply(
      Math,
      notes.map((note) => note.id)
    ) + 1
  )
} */

const now = () => new Date().getTime()

export const { 
  setSearchValue, 
  setActiveCategory, 
  toggleNotesForm, 
  createUpdateNote, 
  editNote, 
  toggleNoteStatus,  
  sortAndFilter, 
  saveNotes, 
  setNotes,
  setCategories, 
  state,
} = slice.actions;


export default slice.reducer
