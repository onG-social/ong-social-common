import { useEffect, useState } from 'react';
import { isObject, get } from 'lodash';
import {useValidators} from './validators';


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
    if(isObject(validation)) return validation;
    return {
        criteria: validation
    };
};

export const useForm = (fields, initialState = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errorMessages, setErrorMessages] = useState({});
    const validations = useValidators();

    const addPath = (fieldName, fieldPath) => fieldPath ? `${fieldPath}.${fieldName}` : fieldName;

    useEffect(()=> {
        const newMessages = {};
        const validate = (_fields, fieldPath) => {
            Object.keys(_fields).forEach(fieldName => {
                const fieldNameWithPath = addPath(fieldName, fieldPath);
                let fieldErrorMessage;
                const field = _fields[fieldName];
                if (Array.isArray(field)) {
                    field.forEach(validation => {
                        const requirements = standardizeValidation(validation);
                        const validator = validation.validator || validations[validation.rule];
                        const value = get(formData, fieldNameWithPath);
                        const {message} = validator(value, requirements);
                        if(message && !fieldErrorMessage){
                            fieldErrorMessage = message || null;
                        }
                    });
                    newMessages[fieldNameWithPath] = fieldErrorMessage;
                } else {
                    validate(field, fieldNameWithPath);
                }
            });
        }
        validate(fields);
        setErrorMessages(newMessages);
    },[formData]);

    const createFieldProps = (fieldName) => {
        const onChange = newValue => {
            console.log('on change ', fieldName)
            const newData = {
                ...formData,
                [fieldName]: newValue?.target ? newValue?.target?.value : newValue
            };
            setFormData(newData);
        };

        return {
            fieldName: fieldName,
            value: get(formData, fieldName),
            onChange,
            errorMessage: errorMessages[fieldName]
        };
    };

    const transform = (_fields, fieldPath) => {
        return Object.keys(_fields).reduce((acc, fieldName) => {
            if (_fields[fieldName] && !Array.isArray(_fields[fieldName]))
                acc[fieldName] = transform(_fields[fieldName], addPath(fieldName, fieldPath));
            else 
                acc[fieldName] = createFieldProps(addPath(fieldName, fieldPath));
            return acc;
        }, {});
    };

    const transformedFields = transform(fields);

    const isValid = () => {
        const allValidations = Object.keys(fields).map(fieldName => {
            const value = get(formData, fieldName);
            const response = fields[fieldName].map(validation => {
                const requirements = standardizeValidation(validation);
                const validator = validation.validator || validations[validation.rule];
                return validator(value, requirements);
            });
            return response;
        });
        return allValidations.flat(Infinity).every(val => val.output === true);
    };

    return [
        transformedFields,
        {
            errorMessages,
            isValid: () => isValid(),
            value: formData,
            setData: (_data) => {
                console.log('setting data', _data);
                setFormData(_data)
            }
        }
    ];
};