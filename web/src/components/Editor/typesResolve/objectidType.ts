export const objectidType = `
/**
 * A class representation of the BSON ObjectId type.
 * @public
 * @category BSONType
 */
declare class ObjectId extends BSONValue {
    get _bsontype(): 'ObjectId';
    /* Excluded from this release type: index */
    static cacheHexString: boolean;
    /* Excluded from this release type: [kId] */
    /* Excluded from this release type: __id */
    /**
     * Create an ObjectId type
     *
     * @param inputId - Can be a 24 character hex string, 12 byte binary Buffer, or a number.
     */
    constructor(inputId?: string | number | ObjectId | ObjectIdLike | Uint8Array);
    /**
     * The ObjectId bytes
     * @readonly
     */
    get id(): Uint8Array;
    set id(value: Uint8Array);
    /** Returns the ObjectId id as a 24 character hex string representation */
    toHexString(): string;
    /* Excluded from this release type: getInc */
    /**
     * Generate a 12 byte id buffer used in ObjectId's
     *
     * @param time - pass in a second based timestamp.
     */
    static generate(time?: number): Uint8Array;
    /**
     * Converts the id into a 24 character hex string for printing, unless encoding is provided.
     * @param encoding - hex or base64
     */
    toString(encoding?: 'hex' | 'base64'): string;
    /** Converts to its JSON the 24 character hex string representation. */
    toJSON(): string;
    /**
     * Compares the equality of this ObjectId with 'otherID'.
     *
     * @param otherId - ObjectId instance to compare against.
     */
    equals(otherId: string | ObjectId | ObjectIdLike): boolean;
    /** Returns the generation date (accurate up to the second) that this ID was generated. */
    getTimestamp(): Date;
    /* Excluded from this release type: createPk */
    /**
     * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
     *
     * @param time - an integer number representing a number of seconds.
     */
    static createFromTime(time: number): ObjectId;
    /**
     * Creates an ObjectId from a hex string representation of an ObjectId.
     *
     * @param hexString - create a ObjectId from a passed in 24 character hexstring.
     */
    static createFromHexString(hexString: string): ObjectId;
    /** Creates an ObjectId instance from a base64 string */
    static createFromBase64(base64: string): ObjectId;
    /**
     * Checks if a value is a valid bson ObjectId
     *
     * @param id - ObjectId instance to validate.
     */
    static isValid(id: string | number | ObjectId | ObjectIdLike | Uint8Array): boolean;
    /* Excluded from this release type: toExtendedJSON */
    /* Excluded from this release type: fromExtendedJSON */
    inspect(): string;
}

/** @public */
declare interface ObjectIdExtended {
    $oid: string;
}

/** @public */
declare interface ObjectIdLike {
    id: string | Uint8Array;
    __id?: string;
    toHexString(): string;
}
`;
