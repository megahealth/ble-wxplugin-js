export const inArray = (arr, key, val) => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) return i
    }
    return -1
}
