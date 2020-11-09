export const minLength = (criteria, message) => {
    return {
        rule: 'minLength',
        criteria,
        message
    };
};

export const maxLength = (criteria, message) => {
    return {
        rule: 'maxLength',
        criteria,
        message
    };
};

export const required = (message) => {
    return {
        rule: 'required',
        criteria: true,
        message
    };
};

export const emailFormat = (message) => {
    return {
        rule: 'emailFormat',
        criteria: true,
        message
    };
};

export const pattern = (criteria, message) => {
    return {
        rule: 'pattern',
        criteria,
        message
    };
};