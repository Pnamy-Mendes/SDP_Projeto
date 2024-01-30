import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom'; 
import { useStyles } from './../styles/AppStyle'


import './../styles/Home.css';
import isAuthenticated from '../util/isAuthenticated'; 

import SearchBox from './SearchBox'
import ControlButtonsContainer from './ControlButtonsContainer'
import AddNoteButton from './AddNoteButton'
import ProgressionIndicator from './ProgressionIndicator'
import NotesList from './NotesList'
import NotesForm from './NotesForm'
import Grid from '@mui/material/Grid'




function Home({ showToast }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isOAuthLogin, setIsOAuthLogin] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const classes = useStyles()
    
    

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }

        // Check if the user clicked on github Login so it ifnores the error handling
        if (!isOAuthLogin) {
            const errorParam = searchParams.get('error');
            if (errorParam) {
                showToast('error', 'Error', decodeURIComponent(errorParam));
            }
        }    
    }, [navigate, searchParams]);
    

    
    return (
        <div>
            {isAuthenticated() && (
                
                <div className={classes.root}> 
                    <Grid container spacing={3} direction="column" className="notes">
                        <Grid item xs={12}>
                            <SearchBox />
                        </Grid>
                        <Grid item container>
                            <Grid item sm={9} xs={12} container>
                                <ControlButtonsContainer />
                            </Grid>
                            <Grid item sm={3} xs={12}>
                                <AddNoteButton />
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <ProgressionIndicator />
                        </Grid>
                        <Grid item xs={12}>
                            <NotesList />
                        </Grid>
                    </Grid>
                    <NotesForm />
                </div>
                
            )} 
        </div>

    );
}

export default Home;
