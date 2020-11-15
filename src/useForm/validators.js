export const useValidators = () => {

    return {
        required: (value, {message}) => {
            const output = value?.length > 0;
            return {
                message: output ? null : message || 'useForm.required',
                output
            };
        },
        maxLength: (value,  {criteria, message}) => {
            const output = value?.length === 0 || value?.length <= criteria;
            return {
                message: output ? null : {id: message || 'useForm.maxLength', length: criteria},
                output
            };

        },
        minLength: (value, {criteria, message}) => {
            const output = value?.length === 0 || value?.length >= criteria;
            return {
                message: output ? null : {id: message || 'useForm.minLength', length: criteria},
                output
            };
        },
        emailFormat: (value, {message}) => {
            const pattern = /\S+@\S+\.\S+/;
            const output = pattern.test(value);
            return {
                message: output ? null : message || 'useForm.email',
                output
            };
        },
        pattern: (value, {criteria, message}) => {
            const pattern = new RegExp(criteria);
            const output = pattern.test(value);
            return {
                message: output ? null : message || 'useForm.pattern',
                output
            };
        },

        genericValidator: (value, { criteria, message }) => {
			const output = criteria();
			return {
				message: output
					? null
					: message || 'useForm.genericValidator',
				output,
			};
		},
    };
};