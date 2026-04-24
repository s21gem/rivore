import multer from 'multer';
import express from 'express';

console.log('Multer version:', (multer as any).version || 'unknown');
const upload = multer({ storage: multer.memoryStorage() });
console.log('Upload object created');
console.log('Memory storage:', !!multer.memoryStorage);
