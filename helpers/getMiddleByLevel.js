export default (arr) => {
    let sum = 0;
    arr.forEach((item)=>{
        sum += item.result.final
    })
    return (sum/arr.length).toFixed()
}


