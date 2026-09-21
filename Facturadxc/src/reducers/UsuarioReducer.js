export const UsuarioReducer = (state = [], action) => {
    switch (action.type) {
        case 'addUsuarioJT':
            return [...state, {
                ...action.payload,
                // id: new Date().getTime()
            }];
        case 'deleteUsuarioJT':
            return state.filter(usuarioJT => usuarioJT.id !== action.payload);

        case 'updateUsuarioJT':
            return state.map(usuarioJT => {
                if (usuarioJT.id === action.payload.id) {
                    return {
                        ...action.payload
                    }
                }
                return usuarioJT;
            });
        case 'addAllUsuarioJT':
            return action.payload;

        default:
            return state;
    }

}