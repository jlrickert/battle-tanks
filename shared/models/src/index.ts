export const sayHello = () => {
	return "hello";
};

export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
	success: true;
	value: T;
};

export type Err<E> = {
	success: false;
	error: E;
};

export const tryCatch = <A, E>(f: () => A, onErr: (error: unknown) => E) => {
	try {
		return {
			success: true,
			value: f(),
		};
	} catch (error) {
		return {
			success: false,
			error: onErr(error),
		};
	}
};

export const absurd = <A>(_: never): A => {
	throw new Error("This is absurd");
};
