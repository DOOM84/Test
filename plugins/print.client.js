import {defineNuxtPlugin} from '#app'
import {Printd} from 'printd';

const cssText = `

.hdn{
display: none;
}

.d-block{
display: block;
}

h1{font-size: 20px; margin-top: 10px}

table {
border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  border: 0.5px solid black;
}

  thead, th, td, tr {
    border: black solid 0.5px;
  }

  th {
    text-align: center;
    padding: 8px;
  }
  td {
    text-align: center;
    padding: 8px;
  }
    `
export default defineNuxtPlugin(nuxtApp => {
    const d = new Printd();
    nuxtApp.provide('print', (el, status) => {
        d.print(el, [cssText]);
        return !status;
    })
})
