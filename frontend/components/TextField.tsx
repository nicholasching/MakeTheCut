import React from 'react';
import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';

// Define the props for your custom TextField component
// Include standard input attributes and the specific props needed
interface CustomTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    label: string;
    value: string | number;
    onChange: (value: string) => void; // Expects a function receiving the value string
    // maxLength is already part of InputHTMLAttributes
    // className is also part of InputHTMLAttributes
}

export default function TextField({
    label,
    id,
    value,
    onChange,
    maxLength,
    className, // Accept className prop
    type = 'text', // Default type
    ...rest // Collect other standard HTML input attributes
}: CustomTextFieldProps) {

    // Handler to adapt MUI's event object to the desired (value: string) signature
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        // Keep the outer div as it was in the original code
        <div>
            <MuiTextField

                id={id} // Pass id down
                label={label}
                value={value} // Pass value down
                onChange={handleChange} // Use the adapted handler
                variant="outlined"
                // Apply the className passed from the parent. This will likely override the internal one.
                // If you need to merge them, it requires more complex logic.
                className={className || "bg-neutral-900 rounded-lg w-2/3"} // Use external className if provided, otherwise fallback to original internal one
                size="medium"
                type={type} // Pass type down
                inputProps={{ // Pass maxLength and other input attributes here
                    maxLength: maxLength,
                    ...rest // Spread other standard input attributes
                }}
                sx={{ // Keep the original sx prop styling untouched
                    '& .MuiOutlinedInput-root': {
                        // Note: The 'color: white' here might target the wrong element for input text.
                        // It's generally better to target '& input' as shown in previous examples,
                        // but adhering to "without changing the styling".
                        color: 'white',
                        fontSize: '0.8rem',

                        '& fieldset': {
                            borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                            borderColor: 'transparent',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: 'gray',
                        fontSize: '0.8rem',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: 'white',
                    },

                }}
            />
        </div>
    );
}