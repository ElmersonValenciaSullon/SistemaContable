export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(amount);
};

export const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateString));
};
