import React, { useEffect, useState } from "react";
import { Button, StyleSheet, TextInput, } from "react-native";
import { View, Text,TouchableOpacity,StatusBar } from "react-native";
import * as SQLite from 'expo-sqlite'

export default function App() {
    const db=SQLite.openDatabase('example.db');
    const [isloading, setloading]=useState(true);
    const [names, setNames]=useState([]);
    const [currentName, setCurrentName]=useState(undefined);
    useEffect(() => {
      db.transaction(tx => {
          tx.executeSql(
              'CREATE TABLE IF NOT EXISTS names(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)',
              [],
              () => {
                  tx.executeSql(
                      'SELECT * FROM names',
                      [],
                      (_, { rows }) => {
                          setNames(rows._array);
                          setloading(false);
                      },
                      (_, error) => console.log(error)
                  );
              },
              (_, error) => console.log(error)
          );
      });
  }, []);
  
    if(isloading){
        return(
            <View style={Styles.content}>
                <Text style={Styles.content}> Loading names</Text>
            </View>
        )
    };
    const addName = () => {
      db.transaction(tx => {
          tx.executeSql(
              'INSERT INTO names(name) VALUES (?)', // Corrected syntax
              [currentName],
              (_, { insertId }) => {
                  let existingNames = [...names];
                  existingNames.push({ id: insertId, name: currentName });
                  setNames(existingNames);
                  setCurrentName(''); // Clear input after adding
              },
              (_, error) => console.log(error)
          );
      });
  };
  const deleteNames=(id)=>{
   db.transaction(tx=>{
   tx.executeSql('DELETE FROM names WHERE id=?',
   [id],
   (_, { rowsAffected })=>{
    if(rowsAffected>0)
    {
      let existingNames= [...names].filter(name=>name.id !==id);
      setNames(existingNames); 
    }
    (_, error) => console.log(error);
   }
   );
   });

  };

  const updateNames=(id)=>{
  db.transaction(tx=>{
  tx.executeSql('UPDATE names SET name=? WHERE id=?',[currentName,id],
  (_, { rowsAffected })=>{
    if(rowsAffected>0){
      let existingNames=[...names];
      const indexUpdate=existingNames.findIndex(name=>name.id===id);
      existingNames[indexUpdate].name=currentName;
      setNames(existingNames);
     setCurrentName('');
    }

  },
  (_, error) => console.log(error)
  )
  });
  };
    const showNames=()=>{
      return names.map((name,index)=>{
        return(
          <View  key={name.id}style={Styles.row}>
            <Text>{name.name}</Text>
            <Button title="Delete" onPress={()=>deleteNames(name.id)}/>
            <Button title="Update" onPress={()=>updateNames(name.id)}/>
          </View>
        )
      })
     };
  return (
    <View>
    <Text style={Styles.content}>CRUD REACT NATIVE</Text>
    <TextInput value={currentName} placeholder="Name" onChangeText={setCurrentName} style={{padding:10}}/>
   <Button title="ADD_NAME" onPress={addName}/>

    {showNames()}
    <StatusBar style="auto"/>
    </View>
  );
}
const Styles=StyleSheet.create({
        content:{
        textAlign:'center',
        marginTop:100,
        fontSize:20,
        fontWeight:'bold'
    },
    row:{
      flexDirection:'row',
      alignSelf:'stretch',
      alignItems:'center',
      justifyContent:'space-between',
      margin:8
    }
})
