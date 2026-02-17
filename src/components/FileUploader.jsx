import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Image, X, AlertCircle, Check } from 'lucide-react';
import { validateFile, isPDF, formatFileSize, ACCEPTED_EXTENSIONS } from '../utils/fileHelpers';

const formatChip = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '9px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(12,18,30,0.72)',
    fontSize: '11px',
    color: '#9ca7c5',
};

export default function FileUploader({ onFileSelect, disabled }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFile = useCallback((file) => {
        setError(null);
        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error);
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
        onFileSelect(file);
    }, [onFileSelect]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!disabled && event.dataTransfer.files.length > 0) {
            handleFile(event.dataTransfer.files[0]);
        }
    }, [handleFile, disabled]);

    const handleInputChange = useCallback((event) => {
        if (event.target.files.length > 0) {
            handleFile(event.target.files[0]);
        }
        event.target.value = '';
    }, [handleFile]);

    const handleRemove = useCallback(() => {
        setSelectedFile(null);
        setError(null);
        onFileSelect(null);
    }, [onFileSelect]);

    const cardBase = {
        width: '100%',
        borderRadius: '18px',
        background: 'linear-gradient(180deg, rgba(18,25,40,0.88), rgba(12,17,28,0.88))',
        border: isDragging
            ? '1px solid rgba(20,184,166,0.62)'
            : selectedFile
                ? '1px solid rgba(34,197,94,0.35)'
                : '1px dashed rgba(255,255,255,0.2)',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : selectedFile ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        padding: selectedFile ? '18px' : '42px 20px',
        boxShadow: isDragging ? '0 12px 30px rgba(20,184,166,0.22)' : 'none',
    };

    return (
        <div style={{ width: '100%' }}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && !selectedFile && fileInputRef.current?.click()}
                style={cardBase}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {selectedFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'rgba(34,197,94,0.14)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {isPDF(selectedFile)
                                    ? <FileText style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                                    : <Image style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                                }
                            </div>
                            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#eef2ff',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {selectedFile.name}
                                </p>
                                <p style={{ fontSize: '11px', color: '#9ca7c5' }}>{formatFileSize(selectedFile.size)}</p>
                            </div>
                            <Check style={{ width: '17px', height: '17px', color: '#22c55e', flexShrink: 0 }} />
                            {!disabled && (
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemove();
                                    }}
                                    style={{
                                        padding: '7px',
                                        borderRadius: '9px',
                                        background: 'rgba(15,22,36,0.72)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#9ca7c5',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <X style={{ width: '14px', height: '14px' }} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '13px',
                                background: isDragging ? 'rgba(20,184,166,0.25)' : 'rgba(20,184,166,0.14)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                transition: 'all 0.2s',
                                transform: isDragging ? 'scale(1.08)' : 'scale(1)',
                            }}>
                                <Upload style={{ width: '22px', height: '22px', color: '#14b8a6' }} />
                            </div>

                            <p style={{ fontSize: '17px', fontWeight: 700, color: '#eef2ff' }}>Drop your file here</p>
                            <p style={{ fontSize: '13px', color: '#9ca7c5', marginTop: '6px', maxWidth: '540px', lineHeight: 1.6 }}>
                                Drag and drop, or click to browse. Supports extracted text from PDF and scanned image files.
                            </p>

                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (!disabled) fileInputRef.current?.click();
                                }}
                                style={{
                                    marginTop: '16px',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(20,184,166,0.35)',
                                    background: 'rgba(20,184,166,0.16)',
                                    color: '#b6fff0',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                Browse Files
                            </button>

                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                                <span style={formatChip}><FileText style={{ width: '12px', height: '12px' }} /> PDF</span>
                                <span style={formatChip}><Image style={{ width: '12px', height: '12px' }} /> PNG / JPG / BMP</span>
                                <span style={formatChip}>Max 10MB</span>
                            </div>
                        </>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    disabled={disabled}
                />
            </div>

            {error && (
                <div
                    style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.24)',
                    }}
                    className="animate-fade-in"
                >
                    <AlertCircle style={{ width: '14px', height: '14px', color: '#f87171', flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: '#fecaca', lineHeight: 1.5 }}>{error}</p>
                </div>
            )}
        </div>
    );
}
