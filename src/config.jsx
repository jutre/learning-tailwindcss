//every route is defined here which lets changin them easily
export const routes = {
    bookListPath:"/",
    favoriteBooksListPath:"/favorites/",
    bookEditPath:"/:bookId/edit/",
    createBookPath:"/create/"
};


export const bookCreatingFormFieldsDef = [
    {
        label: "Title",
        name: "title",
        type: "text",
        validationRules: [
            {
                name: "minLength",
                value: 3,
                message: "field length must be at least three symbols"
            }
        ]
    },
    {
        label: "Author",
        name: "author",
        type: "text",
        validationRules: [
            {
                name: "minLength",
                value: 3,
                message: "field length must be at least three symbols"
            }
        ]
    },
    {
        label: "Preface",
        name: "preface",
        type: "textarea"
    }
];

//book editing form has same fields as new book creating form and an extra "id" field
export const bookEditFormFieldsDef = [
    ...bookCreatingFormFieldsDef,
    { label: "id", name: "id", type: "hidden" }
];

