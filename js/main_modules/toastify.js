export const toastify = (status) => {
    Toastify({
        text: `Producto ${status}`,
        duration: 3000,
        close: true,
        className: "toastifyToast"
    }).showToast();
}