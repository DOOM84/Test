
export const useDTable = (query, isLoading, pagination, page, per_page, search, data, tableData, toFilter) => {
    isLoading.value = true;

    page.value = query.page;
    per_page.value = query.per_page;
    search.value = query.search;

    if(query.fTerm){

        if(query.dir){
            if(query.dir === 'desc'){
                (typeof data[0][query.fTerm] !== 'string') ?
                    data.sort((a,b) => b[query.fTerm]-a[query.fTerm]) :
                    data.sort((a, b) => b[query.fTerm].localeCompare(a[query.fTerm]))
            }else{
                (typeof data[0][query.fTerm] !== 'string') ?
                    data.sort((a,b) => a[query.fTerm]-b[query.fTerm]) :
                    data.sort((a, b) => a[query.fTerm].localeCompare(b[query.fTerm]))
            }
        }
    }

    if(query.search){

        let filtered = [];

         toFilter.some(item => {
            const filtering = data.filter(
                (x) => x[item].toLowerCase().includes(query.search.toLowerCase())
            )
             if(filtering.length) {
                 filtered = filtering;
                 return
             };
        })

        tableData.value = filtered.slice((query.page - 1) * query.per_page, query.page * query.per_page);
        pagination.value = { ...pagination.value, page: query.page, total: filtered.length }
    }else{
        tableData.value = data.slice((query.page - 1) * query.per_page, query.page * query.per_page);
        pagination.value = { ...pagination.value, page: query.page, total: data.length }
    }

    isLoading.value = false;
}