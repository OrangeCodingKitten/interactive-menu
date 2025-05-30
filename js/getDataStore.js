// https://script.google.com/macros/s/AKfycby7WIe_gGCbaQvU7fwiPusfMTRawLAlkXAEcHBkSXVXiv4bWlG3zO3QWqTrcQAGOr03VQ/exec

export async function getDataStore() {
    const apiKey = "AIzaSyBaQSe_UF-KOAwgL7PilePQnEj_50-9A18";
    const sheetId = "1GW8uSMMNcvHaDFQvwITBC7y-EZB-GMh739Xr5Cx5Zoc";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        let finalObject = processData(data.values);
        return finalObject;
    } catch {
        console.error('Ошибка загрузки данных', error);
        return []
    }
}
 
function processData(data) {
    const keys = data[0];
    const objectsArray = data.slice(2).map(row => {
        let obj = {};
        row.forEach((value, index) => {
            obj[keys[index]] = value;
        });
        return obj;
    });
    return objectsArray;
}