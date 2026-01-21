import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  TextField,
  Typography
} from "@mui/material";


// types
interface User {
  id: number;
  name: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
}

interface UserWithNameMeta extends User {
  nameMeta: {
    display: string;
    sortableLastName: string;
  };
}

// extend User with nameMeta (display, sortableLastName)
const parseAndFormatName = (fullName: string) => {
  const nameSegments = fullName.trim().split(/\s+/);

  const firstNameIndex =
    nameSegments.findIndex((t) => !t.endsWith(".")) !== -1
      ? nameSegments.findIndex((t) => !t.endsWith("."))
      : 0;

  const titleSegments = nameSegments.slice(0, firstNameIndex);
  const firstName = nameSegments[firstNameIndex];
  const remaining = nameSegments.slice(firstNameIndex + 1);

  const hasSuffix = remaining.length > 1;
  const suffix = hasSuffix ? remaining[remaining.length - 1] : undefined;
  const lastNameSegments = hasSuffix
    ? remaining.slice(0, -1)
    : remaining;

  const lastName = lastNameSegments.join(" ");

  return {
    display:
      `${lastName}${suffix ? ` ${suffix}` : ""}, ${firstName}` +
      `${titleSegments.length ? ` (${titleSegments.join(" ")})` : ""}`,
    sortableLastName: lastName.toLowerCase(),
  };
};


// UserAutoComplete component
const UserAutocomplete: React.FC = () => {
  const [users, setUsers] = useState<UserWithNameMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithNameMeta | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      const data: User[] = await response.json();

      const formattedUsers = data
        .map((user) => ({
          ...user,
          nameMeta: parseAndFormatName(user.name),
        }))
        .sort((a, b) =>
          a.nameMeta.sortableLastName.localeCompare(
            b.nameMeta.sortableLastName
          )
        );

      setUsers(formattedUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <Box sx={{
      maxWidth: 360,
      mt: 4,
      mx: "auto"
    }}>
      {loading ? (
        <Box sx={{
          display: "flex",
          justifyContent: "center"
        }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <Autocomplete
          options={users}
          getOptionLabel={
            (option) => option.nameMeta.display
          }
          onChange={
            (_event, value) => setSelectedUser(value)
          }
          renderInput={(params) => (
            <TextField {...params} label="Search users" />
          )}
        />
      )}

      {selectedUser && (
        <Box sx={{ mt: 4 }}>
          <Typography>{selectedUser.nameMeta.display}</Typography>
          <Typography>{selectedUser.address.street}</Typography>
          <Typography>{selectedUser.address.suite}</Typography>
          <Typography>{`${selectedUser.address.city}, ${selectedUser.address.zipcode}`}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserAutocomplete;
