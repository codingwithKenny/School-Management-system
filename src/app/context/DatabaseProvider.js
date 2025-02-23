
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getDatabaseData } from "../actions/getDatabaseData";

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [databaseData, setDatabaseData] = useState({
    sessions: [],
    grades: [],
    classes: [],
    subjects: [],
    parents: [],
    teachers:[] ,
    term:[],
    paymentHistory:[],
    studentHistory: [],
    student:[]
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log("🟡 Fetching database data...");
      const result = await getDatabaseData();
      if (result.success) {
        setDatabaseData(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <DatabaseContext.Provider value={{ databaseData, loading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
 
