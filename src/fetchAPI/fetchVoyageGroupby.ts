import axios from 'axios';
import { AUTHTOKEN, BASEURL } from '../share/AUTH_BASEURL';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchVoyageGroupby = createAsyncThunk(
    'VoyageGroupby/fetchVoyageGroupby',
    async (formData: FormData) => {
        try {
            const response = await axios.post(
                `${BASEURL}voyage/groupby2`,
                formData,
                {
                    headers: { 'Authorization': AUTHTOKEN },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch fetchVoyageGroupby data');
        }
    }
);