import { useEffect, useState } from 'react';
import { isObject } from 'lodash';
import { useValidators } from './validators';


/*
const {fields, form} = useForm({
    email: {
        required: {
            criteria: true // should be default true
            message: '' // if not provided use the default required message
        }
        minLength: 3
    },
    password: {
        required: {
            criteria: true // should be default true
            message: '' // if not provided use the default required message
        }
        minLength: {
            criteria: 3
            message:  // if not provided use the default  message
        },
        maxLength: {
            criteria: 14
            message:  // if not provided use the default  message
        }
    }
});


form.value  // {email, password}
form.showError() // invoke the error message displayed on components
form.isValid // boolean

fields.email //

<InputComponent name="lero lero eh Mato!!!" {...fields.email} />

*/




const standardizeValidation = (validation) => {
    if (isObject(validation)) return validation;
    return {
        criteria: validation
    };
};

export const useForm = (initialFields, initialState = {}) => {
    const [fields, setFields] = useState(initialFields);
    const [formData, setFormData] = useState(initialState);
    const [errorMessages, setErrorMessages] = useState({});
    const [showErrors, setShowErrors] = useState(false);
    const validations = useValidators();

    useEffect(() => {
        const newMessages = {};
        Object.keys(fields).forEach(fieldName => {
            let fieldErrorMessage;
            const field = fields[fieldName];
            field.forEach(validation => {
                const requirements = standardizeValidation(validation);
                const validator = validation.validator || validations[validation.rule];
                const value = formData[fieldName]?.trim();
                const { message } = validator(value, requirements);
                if (message && !fieldErrorMessage) {
                    fieldErrorMessage = message || null;
                }
            });
            newMessages[fieldName] = fieldErrorMessage;
        });
        setErrorMessages(newMessages);
    }, [formData]);

    const createFieldProps = (fieldName) => {
        const onChange = newValue => {
            const newData = {
                ...formData,
                [fieldName]: newValue?.target ? newValue?.target?.value : newValue
            };
            setFormData(newData);
        };

        return {
            value: formData[fieldName],
            onChange,
            errorMessage: errorMessages[fieldName],
            showErrors
        };
    };

    const transformedFields = Object.keys(fields).reduce((acc, fieldName) => {
        acc[fieldName] = createFieldProps(fieldName);
        return acc;
    }, {});

    const isValid = () => {
        const allValidations = Object.keys(fields).map(fieldName => {
            const value = formData[fieldName]?.trim();
            const response = fields[fieldName].map(validation => {
                const requirements = standardizeValidation(validation);
                const validator = validation.validator || validations[validation.rule];
                return validator(value, requirements);
            });
            return response;
        });
        return allValidations.flat(Infinity).every(val => val.output === true);
    };

    const resetForm = () => {
        setShowErrors(false);
        setFormData(initialState);
    }

    return [
        transformedFields,
        {
            errorMessages,
            isValid: () => isValid(),
            value: formData,
            setData: (data) => setFormData(data),
            showErrors: () => setShowErrors(true),
            setFields,
            resetForm
        }
    ];
};