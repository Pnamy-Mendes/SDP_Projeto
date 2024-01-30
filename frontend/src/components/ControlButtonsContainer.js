import React, { useEffect } from 'react'
import ControlButton from './ControlButton'
import { useStyles } from './../styles/ControlButtonsStyle'
import { useSelector, useDispatch } from 'react-redux'
import { setActiveCategory, setCategories } from './../redux/notesReducer'
import notesCategories from './../util/NotesCategories'

export default function ControlButtons() {
  const classes = useStyles()
  const categories = Object.keys(notesCategories)
  const activeCategory = useSelector((state) => state.notes.activeCategory)
  const dispatch = useDispatch()

  /* useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories', {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await response.json();
        dispatch(setCategories(categoriesData));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [dispatch]); */
  

  return (
    <div className={classes.root} style={{display:"none"}}>
      <ControlButton
        name="All"
        type="primary"
        active={activeCategory === 'All'}
        onClick={() => dispatch(setActiveCategory('All'))}
        displayIndicator={false}
      ></ControlButton>

      {categories.map((category, index) => (
        <ControlButton
          name={category}
          type={notesCategories[category]}
          active={activeCategory === category}
          onClick={() => dispatch(setActiveCategory(category))}
          key={index}
        ></ControlButton>
      ))}
    </div>
  )
}
