import { Municipality } from "@/lib/types/types";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { TextField } from "@material-ui/core";
import React, { ChangeEvent, ReactElement, useState } from "react";
import { Autocomplete } from "@material-ui/lab";

interface Props {
  municipalities: Municipality[];
  value: Municipality | undefined;
  onSelect: (value: Municipality | undefined) => void;
  placeholderText: string;
}

export const MunicipalityDropdown = (props: Props): ReactElement => {
  const [searchText, setSearchText] = useState<string>("");

  const handleMunicipality = (event: ChangeEvent<unknown>, value: Municipality | null) => {
    setSearchText(value ? value.displayName : "");
    props.onSelect(value || undefined);
  };

  const splitAndBoldSearchText = (displayName: string): ReactElement => {
    const index = displayName.toLowerCase().indexOf(searchText.toLowerCase());
    if (index >= 0) {
      const prefixText = displayName.substr(0, index);
      const toBold = displayName.substr(index, searchText.length);
      const afterText = displayName.substr(index + searchText.length);
      return (
        <span style={{ whiteSpace: "pre-wrap" }}>
          {prefixText}
          <span className="text-bold">{toBold}</span>
          {afterText}
        </span>
      );
    } else {
      return <>{displayName}</>;
    }
  };

  return (
    <Autocomplete
      options={props.municipalities}
      getOptionLabel={(municipality: Municipality) => municipality.displayName}
      getOptionSelected={(option: Municipality, value: Municipality) => option.id === value.id}
      value={props.value || null}
      onChange={handleMunicipality}
      renderOption={(option) =>
        props.value?.id === option.id ? (
          <MenuOptionSelected>{option.displayName}</MenuOptionSelected>
        ) : (
          <MenuOptionUnselected>{splitAndBoldSearchText(option.displayName)}</MenuOptionUnselected>
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{
            "aria-label": "Location",
            "data-testid": "municipality",
            ...params.inputProps,
          }}
          value={searchText}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value)}
          variant="outlined"
          placeholder={props.placeholderText}
        />
      )}
      fullWidth
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
