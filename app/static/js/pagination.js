export function paginate(array, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
}

export function calculateTotalPages(arrayLength, itemsPerPage) {
    return Math.ceil(arrayLength / itemsPerPage);
}
