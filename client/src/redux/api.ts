'use client';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Upload } from '../types';
const BASE_URL = process.env.CLIENT_URL;



export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Uploads'],
  endpoints: (builder) => ({
    register: builder.mutation<{ message: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<{ token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getUploads: builder.query<Upload[], void>({
      query: () => '/pdf/list',
      providesTags: ['Uploads'],
    }),
    deletePdf: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/pdf/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Uploads'], // triggers refetch
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUploadsQuery,
  useDeletePdfMutation,
} = apiSlice;
